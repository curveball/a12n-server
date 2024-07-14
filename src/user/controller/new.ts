import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound, UnprocessableContent } from '@curveball/http-errors';
import { createUserForm } from '../formats/html.js';
import * as services from '../../services.js';

type UserNewForm = {
  identity: string;
  nickname: string;
  active: string;
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

    const identity = ctx.request.body.identity;
    const nickname = ctx.request.body.nickname;

    if (!services.principal.isIdentityValid(identity)) {
      throw new UnprocessableContent('Identity must be a valid URI');
    }

    try {
      await principalService.findByIdentity(ctx.request.body.identity);
      ctx.status = 303;
      ctx.response.headers.set('Location', '/user/new?error=User+already+exists');
      return;
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }

    const newUser = await principalService.save({
      nickname: nickname,
      createdAt: new Date(),
      modifiedAt: new Date(),
      type: 'user',
      active: 'active' in ctx.request.body
    });

    await services.principalIdentity.create(
      {
        href: identity,
        principalId: newUser.id,
        isPrimary: true,
        label: null,
        markVerified: newUser.active,
      }
    );

    ctx.response.status = 303;
    ctx.response.headers.set('Location', '/user/' + newUser.id);

  }

}

export default new CreateUserController();
