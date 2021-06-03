import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';
import * as querystring from 'querystring';
import log from '../../log/service';
import { EventType } from '../../log/types';
import { MFALoginSession } from '../../mfa/types';
import * as webAuthnService from '../../mfa/webauthn/service';
import { getSetting } from '../../server-settings';
import * as principalService from '../../principal/service';
import * as userService from '../../user/service';
import { User } from '../../principal/types';
import { isValidRedirect } from '../utilities';
import { loginForm } from '../formats/html';

class LoginController extends Controller {

  async get(ctx: Context) {

    const firstRun = !(await principalService.hasPrincipals());
    if (firstRun) {
      ctx.redirect(302, '/register');
      return;
    }

    ctx.response.type = 'text/html';
    ctx.response.body = loginForm(
      ctx.query.msg,
      ctx.query.error,
      {
        continue: ctx.query.continue,
      },
      await getSetting('registration.enabled'),
    );

  }

  async post(ctx: Context<any>) {

    let user: User;
    try {
      user = await principalService.findByIdentity('mailto:' + ctx.request.body.userName) as User;
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

    if (await this.shouldMfaRedirect(ctx, user)) {
      return;
    }

    ctx.session = {
      user: user,
    };
    log(EventType.loginSuccess, ctx);

    ctx.status = 303;
    if (ctx.request.body.continue) {
      ctx.response.headers.set('Location', ctx.request.body.continue);
      return;
    }

    ctx.response.redirect(303, getSetting('login.defaultRedirect'));

  }

  redirectToLogin(ctx: Context<any>, msg: string, error: string) {

    const params: any = { msg, error };
    if (ctx.request.body?.continue) {
      params['continue'] = ctx.request.body.continue;
    }
    ctx.response.status = 303;
    ctx.response.headers.set('Location', '/login?' + querystring.stringify(params));

  }

  async shouldMfaRedirect(ctx: Context, user: User): Promise<boolean> {
    if (!this.isMfaEnabled())  {
      return false;
    }

    if (await this.shouldUseTotp(ctx, user)) {
      return true;
    }

    if (await this.shouldUseWebauthn(ctx, user)) {
      return true;
    }

    return false;
  }

  async shouldUseTotp(ctx: Context<any>, user: User): Promise<boolean> {
    if (getSetting('totp') !== 'disabled') {
      if (await userService.hasTotp(user)) {

        if (ctx.request.body.continue && !isValidRedirect(ctx.request.body.continue)) {
          this.redirectToLogin(ctx, '', 'Invalid continue URL provided');
          return true;
        }

        const mfaSession: MFALoginSession = {
          user,
          mfaType: 'totp'
        };

        ctx.session = {
          mfa: mfaSession,
        };

        this.redirectToMfa(ctx, ctx.request.body.continue);
        return true;
      }

      if (getSetting('totp') === 'required') {
        this.redirectToLogin(ctx, '', 'The system administrator has made TOTP tokens mandatory, but this user did not have a TOTP configured. Login is disabled');
        return true;
      }
    }

    return false;
  }

  async shouldUseWebauthn(ctx: Context<any>, user: User): Promise<boolean> {
    if (getSetting('webauthn') !== 'disabled') {
      if (await webAuthnService.hasWebauthn(user)) {

        if (ctx.request.body.continue && !isValidRedirect(ctx.request.body.continue)) {
          this.redirectToLogin(ctx, '', 'Invalid continue URL provided');
          return true;
        }

        const mfaSession: MFALoginSession = {
          user,
          mfaType: 'webauthn'
        };

        ctx.session = {
          mfa: mfaSession,
        };

        this.redirectToMfa(ctx, ctx.request.body.continue);
        return true;
      }

      if (getSetting('webauthn') === 'required') {
        this.redirectToLogin(ctx, '', 'The system administrator has made Webauthn mandatory, but this user did not have a Webauthn device configured. Login is disabled');
        return true;
      }
    }

    return false;
  }

  isMfaEnabled(): boolean {
    return getSetting('totp') !== 'disabled' || getSetting('webauthn') !== 'disabled';
  }

  redirectToMfa(ctx: Context, redirectUrl: string) {

    ctx.response.status = 303;
    if (redirectUrl) {
      ctx.response.headers.set('Location', '/login/mfa?' + querystring.stringify({ 'continue': redirectUrl }));
    } else {
      ctx.response.headers.set('Location', '/login/mfa');
    }

  }

}

export default new LoginController();
