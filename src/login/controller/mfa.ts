import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as services from '../../services.js';

import * as querystring from 'querystring';
import { isValidRedirect } from '../utilities.js';
import { MFALoginSession } from '../../mfa/types.js';
import { mfaForm } from '../formats/html.js';
import { getLoggerFromContext } from '../../log/service.js';

/**
 * Multi-factor-auth controller
 *
 * Handles both TOTP and Webauthn
 */
class MFAController extends Controller {

  async get(ctx: Context) {

    const { user, mfaType }: MFALoginSession = ctx.session.mfa || {};

    if (!user) {
      return this.redirectToLogin(ctx);
    }

    const useTotp = mfaType === 'totp';
    const useWebAuthn = mfaType === 'webauthn';

    ctx.response.type = 'text/html';
    ctx.response.body = mfaForm(
      ctx.query.msg,
      ctx.query.error,
      useTotp,
      useWebAuthn,
      {
        continue: ctx.query.continue,
      },
    );

  }

  async post(ctx: Context<any>) {

    const { user }: MFALoginSession = ctx.session.mfa || {};

    if (!user) {
      return this.redirectToLogin(ctx);
    }

    const log = getLoggerFromContext(ctx, user);

    if (ctx.request.body.totp) {
      if (!await services.mfaTotp.validateTotp(user, ctx.request.body.totp)) {
        await log('totp-failed');
        return this.redirectToMfa(ctx, 'Incorrect TOTP code');
      }
    } else {
      return this.redirectToMfa(ctx, 'TOTP token required');
    }

    if (ctx.request.body.continue && !isValidRedirect(ctx.request.body.continue)) {
      return this.redirectToMfa(ctx, 'Invalid continue URL provided');
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
    ctx.response.headers.set('Location', '/');

  }

  async redirectToMfa(ctx: Context, error: string) {

    ctx.response.status = 303;
    ctx.response.headers.set('Location', '/login/mfa?' + querystring.stringify({ error }));

  }

  async redirectToLogin(ctx: Context) {

    ctx.response.status = 303;
    ctx.response.headers.set('Location', '/login');

  }
}

export default new MFAController();
