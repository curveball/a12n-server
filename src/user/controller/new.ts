import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';
import { createUserForm } from '../formats/html.js';
import * as services from '../../services.js';
import { UserNewFormBody } from '../../api-types.js';
import { generatePassword } from '../../crypto.js';
import { newUserResult } from '../formats/hal.js';

class CreateUserController extends Controller {

  async get(ctx: Context) {

    ctx.privileges.require('admin');

    ctx.response.type = 'text/html';
    ctx.response.body = createUserForm({
      msg: ctx.query.msg,
      error: ctx.query.error,
      csrfToken: await ctx.getCsrf()
    });
  }

  async post(ctx: Context) {

    ctx.request.validate<UserNewFormBody>('https://curveballjs.org/schemas/a12nserver/user-new-form.json');
    const principalService = new services.principal.PrincipalService(ctx.privileges);

    const nickname = ctx.request.body.nickname;

    const identity = ctx.request.body.email ? 'mailto:' + ctx.request.body.email : null;

    if (identity) {
      try {
        await principalService.findByIdentity(identity);
        ctx.status = 303;
        ctx.response.headers.set('Location', '/user/new?error=User+already+exists');
        return;
      } catch (err) {
        if (!(err instanceof NotFound)) {
          throw err;
        }
      }
    }

    const newUser = await principalService.save({
      nickname: nickname,
      createdAt: new Date(),
      modifiedAt: new Date(),
      type: 'user',
      active: true,
    });

    let identityModel = null;
    if (identity) {
      identityModel = await services.principalIdentity.create(
        {
          uri: 'mailto:' + ctx.request.body.email,
          principal: newUser,
          isPrimary: true,
          isMfa: false,
          label: null,
          markVerified: !!ctx.request.body.markEmailValid,
        }
      );
    }

    let password = null;
    if (ctx.request.body.autoGeneratePassword) {
      password = generatePassword();
      await services.user.createPassword(
        newUser,
        password,
      );
    }

    ctx.response.status = 201;
    ctx.response.body = newUserResult(newUser, password, identityModel ? [identityModel] : []);

  }

}

export default new CreateUserController();
