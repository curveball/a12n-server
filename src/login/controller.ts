import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';
import querystring from 'querystring';
import log from '../log/service';
import { EventType } from '../log/types';
import { getSetting } from '../server-settings';
import * as userService from '../user/service';
import { User } from '../user/types';
import { loginForm } from './formats/html';

class LoginController extends Controller {

  async get(ctx: Context) {
    ctx.response.type = 'text/html';
    ctx.response.body = loginForm(
      ctx.query.msg,
      ctx.query.error,
      await getSetting('registration.enabled'),
      await getSetting('totp')
    );

  }

  async post(ctx: Context) {

    let user: User;
    try {
      user = await userService.findByIdentity('mailto:' + ctx.request.body.userName);
    } catch (err) {
      if (err instanceof NotFound) {
        log(EventType.loginFailed, ctx);
        return this.redirectToLogin(ctx, '', 'Incorrect username or password');
      } else {
        throw err;
      }
    }

    if (!await userService.validatePassword(user, ctx.request.body.password)) {
      log(EventType.loginFailed, ctx.ip(), user.id);
      return this.redirectToLogin(ctx, '', 'Incorrect username or password');
    }

    if (!user.active) {
      log(EventType.loginFailedInactive, ctx.ip(), user.id, ctx.request.headers.get('User-Agent'));
      return this.redirectToLogin(ctx, '', 'This account is inactive. Please contact Admin');
    }

    if (ctx.request.body.totp) {
      if (!await userService.validateTotp(user, ctx.request.body.totp)) {
        log(EventType.totpFailed, ctx.ip(), user.id);
        return this.redirectToLogin(ctx, '', 'Incorrect TOTP code');
      }
    } else if (await userService.hasTotp(user)) {
      return this.redirectToLogin(ctx, '', 'TOTP token required');
    } else if (await getSetting('totp') === 'required') {
      return this.redirectToLogin(ctx, '', 'The system administrator has made TOTP tokens mandatory, but this user did not have a TOTP configured. Login is disabled');
    }

    ctx.state.session = {
      user: user,
    };
    log(EventType.loginSuccess, ctx);
    ctx.status = 303;
    ctx.response.headers.set('Location', '/');

  }

  async redirectToLogin(ctx: Context, msg: string, error: string) {

    ctx.response.status = 303;
    ctx.response.headers.set('Location', '/login?' + querystring.stringify({ msg, error }));

  }

}

export default new LoginController();
