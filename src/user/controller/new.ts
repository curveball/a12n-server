import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';
import { createUserForm } from '../formats/html.js';
import * as services from '../../services.js';

type UserNewForm = {
  nickname: string;
  email: string;
  markEmailValid: string;
}

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

    ctx.request.validate<UserNewForm>('https://curveballjs.org/schemas/a12nserver/user-new-form.json');
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
      active: 'active' in ctx.request.body
    });

    if (identity) {
      await services.principalIdentity.create(
        {
          href: 'mailto:' + ctx.request.body.email,
          principalId: newUser.id,
          isPrimary: true,
          label: null,
          markVerified: !!ctx.request.body.markEmailValid,
        }
      );
    }

    ctx.response.status = 303;
    ctx.response.headers.set('Location', newUser.href);

  }

}

export default new CreateUserController();
