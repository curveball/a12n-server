import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden, NotFound } from '@curveball/http-errors';
import { getSetting } from '../../server-settings.ts';
import { registrationForm } from '../formats/html.ts';
import { User } from '../../types.ts';
import * as services from '../../services.ts';

class UserRegistrationController extends Controller {

  async get(ctx: Context) {

    const firstRun = !(await services.principal.hasUsers());

    ctx.response.type = 'text/html';
    ctx.response.body = registrationForm(
      ctx.query.msg,
      ctx.query.error,
      getSetting('registration.mfa.enabled'),
      firstRun,
      ctx.query.continue
    );

  }

  async post(ctx: Context) {

    const firstRun = !(await services.principal.hasUsers());

    const body: any = ctx.request.body;
    const userPassword = body.password;
    const confirmPassword = body.confirmPassword;
    const addMfa = 'addMfa' in body;

    /**
     * We use an 'insecure' context for registration because it's anonymous
     */
    const principalService = new services.principal.PrincipalService('insecure');

    if (userPassword !== confirmPassword) {
      ctx.status = 303;
      ctx.response.headers.set('Location', '/register?' + new URLSearchParams({
        error: 'Password mismatch. Please try again',
        ...( body.continue ? {continue: body.continue} : {} )
      }));
      return;
    }

    try {
      await principalService.findByIdentity('mailto:' + body.emailAddress);
      ctx.status = 303;
      ctx.response.headers.set('Location', '/register?' + new URLSearchParams({
        error: 'User with this email adddress already exists',
        ...( body.continue ? {continue: body.continue} : {} )
      }));
      return;
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }

    const user: User = await principalService.save({
      nickname: body.nickname,
      createdAt: new Date(),
      modifiedAt: new Date(),
      type: 'user',
      active: true,
    }) as User;

    if (firstRun) {
      // The first user will be an admin
      await services.privilege.addPrivilegeForUser(
        user,
        'admin',
        '*'
      );
    }

    await services.user.createPassword(user, userPassword);

    await services.principalIdentity.create(
      {
        uri: 'mailto:' + body.emailAddress,
        principal: user,
        label: null,
        isPrimary: true,
        isMfa: false,
        // If this was the first run, we assume the email is verified
        // to make it quicker to log in.
        markVerified: firstRun,
      }
    );

    if (addMfa && getSetting('registration.mfa.enabled')) {
      ctx.session = {
        registerUser: user,
        registerContinueUrl: body.continue,
      };

      ctx.response.status = 303;
      ctx.response.headers.set('Location', '/register/mfa');
      return;
    }

    ctx.status = 303;

    if (body.continue) {
      ctx.response.headers.set('Location', body.continue);
    } else {
      ctx.response.headers.set('Location', '/login?msg=Registration+successful.+Please log in');
    }

  }

  async dispatch(ctx: Context) {

    if (!getSetting('registration.enabled')) {
      throw new Forbidden('This feature is disabled');
    }
    return super.dispatch(ctx);

  }

}

export default new UserRegistrationController();
