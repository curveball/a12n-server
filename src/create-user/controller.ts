import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';
import * as userService from '../user/service';
import { createUserForm } from './formats/html';

class CreateUserController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = createUserForm(ctx.query.msg, ctx.query.error);
  }

  async post(ctx: Context) {

    try {
      await userService.findByIdentity(ctx.request.body.identity);
      ctx.status = 303;
      ctx.response.headers.set('Location', '/create-user?error=User+already+exists');
      return;
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }

    const newUser = await userService.save({
      identity: ctx.request.body.identity,
      nickname: ctx.request.body.nickname,
      created: new Date(),
      type: ctx.request.body.type,
      active: 'active' in ctx.request.body
    });

    ctx.response.status = 303;
    ctx.response.headers.set('Location', '/user/' + newUser.id);

  }

}

export default new CreateUserController();
