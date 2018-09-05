import { Context, Middleware } from '@curveball/core';
import querystring from 'querystring';
import BaseController from '../base-controller';
import * as UserService from '../user/service';
import { User } from '../user/types';
import { loginForm } from './formats/html';

class LoginController extends BaseController {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = loginForm(ctx.query.msg);

  }

  async post(ctx: Context) {

    let user: User;
    try {
      user = await UserService.findByIdentity('mailto:' + ctx.request.body.username);
    } catch (err) {
      return this.redirectToLogin(ctx, 'Incorrect username or password');
    }

    if (!await UserService.validatePassword(user, ctx.request.body.password)) {
      return this.redirectToLogin(ctx, 'Incorrect username or password');
    }

    if (!await UserService.validateTotp(user, ctx.request.body.totp)) {
      return this.redirectToLogin(ctx, 'Incorrect TOTP code');
    }

    ctx.response.body = { status: 'Success!' };

  }

  async redirectToLogin(ctx: Context, msg: string) {

    ctx.response.status = 302;
    ctx.response.headers.set('Location', '/login?' + querystring.stringify({ msg }));

  }

}

function mw(): Middleware {
  const controller = new LoginController();
  return controller.dispatch.bind(controller);
}

export default mw();
