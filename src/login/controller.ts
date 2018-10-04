import { Context, Middleware } from '@curveball/core';
import querystring from 'querystring';
import BaseController from '../base-controller';
import log from '../log/service';
import { EventType } from '../log/types';
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
      log(EventType.loginFailed, ctx);
      return this.redirectToLogin(ctx, 'Incorrect username or password');
    }

    if (!await UserService.validatePassword(user, ctx.request.body.password)) {
      log(EventType.loginFailed, ctx.ip(), user.id);
      return this.redirectToLogin(ctx, 'Incorrect username or password');
    }

    if (!await UserService.validateTotp(user, ctx.request.body.totp)) {
      log(EventType.totpFailed, ctx.ip(), user.id);
      return this.redirectToLogin(ctx, 'Incorrect TOTP code');
    }

    ctx.state.session = {
      user: user,
    };
    log(EventType.loginSuccess, ctx);
    ctx.status = 303;
    ctx.response.headers.set('Location', '/');

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
