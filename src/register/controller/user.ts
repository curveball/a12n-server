import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden, NotFound } from '@curveball/http-errors';
import { getSetting } from '../../server-settings';
import * as userService from '../../user/service';
import { registrationForm } from '../formats/html';

class UserRegistrationController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = registrationForm(
      ctx.query.msg,
      ctx.query.error,
      getSetting('registration.mfa.enabled')
    );

  }

  async post(ctx: Context) {

    const userPassword = ctx.request.body.password;
    const confirmPassword = ctx.request.body.confirmPassword;
    const addMfa = 'addMfa' in ctx.request.body;

    if (userPassword !== confirmPassword) {
      ctx.status = 303;
      ctx.response.headers.set('Location', '/register?error=Password+mismatch.+Please+try+again');
      return;
    }

    try {
      await userService.findByIdentity('mailto:' + ctx.request.body.emailAddress);
      ctx.status = 303;
      ctx.response.headers.set('Location', '/register?error=User+already+exists');
      return;
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }

    const user = await userService.save({
      identity: 'mailto:' + ctx.request.body.emailAddress,
      nickname: ctx.request.body.nickname,
      created: new Date(),
      type: 'user',
      active: false
    });

    await userService.createPassword(user, userPassword);

    if (addMfa && getSetting('registration.mfa.enabled')) {
      ctx.state.session = {
        registerUser: user,
      };

      ctx.response.status = 303;
      ctx.response.headers.set('Location', '/register/mfa');
      return;
    }

    ctx.status = 303;
    ctx.response.headers.set('Location', '/login?msg=Registration+successful.+Please log in');

  }

  async dispatch(ctx: Context) {

    if (!getSetting('registration.enabled')) {
      throw new Forbidden('This feature is disabled');
    }
    return super.dispatch(ctx);

  }


}

export default new UserRegistrationController();
