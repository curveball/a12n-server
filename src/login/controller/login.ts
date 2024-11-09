import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';
import * as querystring from 'querystring';
import { getLoggerFromContext } from '../../log/service.js';
import { MFALoginSession } from '../../mfa/types.js';
import * as webAuthnService from '../../mfa/webauthn/service.js';
import { hasUsers, PrincipalService } from '../../principal/service.js';
import { getSetting } from '../../server-settings.js';
import * as services from '../../services.js';
import { PrincipalIdentity, User } from '../../types.js';
import { loginForm } from '../formats/html.js';
import { isValidRedirect } from '../utilities.js';

class LoginController extends Controller {

  async get(ctx: Context) {

    const continueParam = ctx.query.continue ? '?' + new URLSearchParams({continue: ctx.query.continue}) : '';
    const registrationUri = '/register' + continueParam;
    const resetPasswordUri = '/reset-password' + continueParam;

    const firstRun = !(await hasUsers());
    if (firstRun) {
      // The 'continue' query parameter contains the URL we want to redirect to after registration
      ctx.redirect(302, registrationUri);
      return;
    }

    ctx.response.type = 'text/html';
    ctx.response.body = loginForm(
      ctx.query.msg,
      ctx.query.error,
      {
        continue: ctx.query.continue,

      },
      getSetting('registration.enabled'),
      registrationUri,
      resetPasswordUri,
    );

  }

  async post(ctx: Context<any>) {

    const principalService = new PrincipalService('insecure');
    let identity: PrincipalIdentity;
    try {
      identity = await services.principalIdentity.findByUri('mailto:' + ctx.request.body.userName);
    } catch (err) {
      if (err instanceof NotFound) {
        return this.redirectToLogin(ctx, '', 'Incorrect username or password');
      } else {
        throw err;
      }
    }

    const user = (await principalService.findByIdentity(identity)) as User;

    const log = getLoggerFromContext(ctx, user);

    if (!user.active) {
      await log('login-failed-inactive');
      return this.redirectToLogin(ctx, '', 'This account is inactive. Please contact Admin');
    }
    if (!identity.verifiedAt) {
      await log('login-failed-notverified');
      return this.redirectToLogin(ctx, '', 'This identity has not been verified');
    }

    if (await this.shouldMfaRedirect(ctx, user)) {
      return;
    }

    const { success, errorMessage } = await services.user.validateUserCredentials(user, ctx.request.body.password, log);
    if (!success && errorMessage) {
      return this.redirectToLogin(ctx, '', errorMessage);
    }

    ctx.session = {
      user: user,
    };
    await log('login-success');

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
      if (await services.mfaTotp.hasTotp(user)) {

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
