import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden, NotFound, UnprocessableEntity } from '@curveball/http-errors';
import * as privilegeService from '../privilege/service';
import * as userService from '../user/service';
import { PrincipalTypeList } from '../user/types';
import { createUserForm } from './formats/html';

class CreateUserController extends Controller {

  async get(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can create new users');
    }
    ctx.response.type = 'text/html';
    ctx.response.body = createUserForm(ctx.query.msg, ctx.query.error);
  }

  async post(ctx: Context<any>) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can create new users');
    }

    const identity = ctx.request.body.identity;
    const nickname = ctx.request.body.nickname;
    const type = ctx.request.body.type;

    if (!identity || !identity.includes(':') || identity.includes(' ')) {
      throw new UnprocessableEntity('Identity must exist and must be a url');
    }
    if (nickname.length < 1) {
      throw new UnprocessableEntity('nickname must contain at least 1 character');
    }

    if (!PrincipalTypeList.includes(type)) {
      throw new UnprocessableEntity('type must be one of ' + PrincipalTypeList.join(', '));
    }

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
      identity: identity,
      nickname: nickname,
      created: new Date(),
      type: type,
      active: 'active' in ctx.request.body
    });

    ctx.response.status = 303;
    ctx.response.headers.set('Location', '/user/' + newUser.id);

  }

}

export default new CreateUserController();
