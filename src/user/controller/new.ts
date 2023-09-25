import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound, UnprocessableEntity } from '@curveball/http-errors';
import { PrincipalService, isIdentityValid } from '../../principal/service';
import { createUserForm } from '../formats/html';

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
    const principalService = new PrincipalService(ctx.privileges);

    const identity = ctx.request.body.identity;
    const nickname = ctx.request.body.nickname;

    if (!isIdentityValid(identity)) {
      throw new UnprocessableEntity('Identity must be a valid URI');
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
      identity: identity,
      nickname: nickname,
      createdAt: new Date(),
      modifiedAt: new Date(),
      type: 'user',
      active: 'active' in ctx.request.body
    });

    ctx.response.status = 303;
    ctx.response.headers.set('Location', '/user/' + newUser.id);

  }

}

export default new CreateUserController();
