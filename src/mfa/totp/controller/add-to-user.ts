import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { authenticator } from 'otplib';
import { Forbidden } from '@curveball/http-errors';

import { generateSecret, generateTotpQrcode, save } from '../service.ts';
import { registrationForm } from '../formats/html.ts';
import * as services from '../../../services.ts';

/**
 * This controller is responsible for adding TOTP to an existing user.
 */
class TOTPAddToUserController extends Controller {
  async get(ctx: Context) {

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id, 'user');

    if (ctx.auth.equals(principal) && !ctx.privileges.has('admin')) {
      throw new Forbidden('You can only use this API for yourself, or if you have \'admin\' privileges');
    }

    const secret = generateSecret();
    const qrCode = await generateTotpQrcode(principal, secret);

    ctx.response.type = 'text/html';
    ctx.response.body = registrationForm({
      action: ctx.path,
      message: ctx.query.msg,
      error: ctx.query.error,
      secret,
      qrCode,
      csrfToken: await ctx.getCsrf(),
    });
  }

  async post(ctx: Context) {

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id, 'user');

    if (ctx.auth.equals(principal) && !ctx.privileges.has('admin')) {
      throw new Forbidden('You can only use this API for yourself, or if you have \'admin\' privileges');
    }

    const { code, secret, continueUrl } = ctx.request.body;
    const validCode = authenticator.check(code, secret);

    if (!validCode) {
      const qrCode = await generateTotpQrcode(principal, secret);
      ctx.response.type = 'text/html';
      ctx.response.body = registrationForm({
        action: ctx.path,
        message: ctx.query.msg,
        error: 'Incorrect verification code. Make sure your device is set to the correct time, and try again',
        secret,
        qrCode,
        csrfToken: await ctx.getCsrf(),
      });
      return;
    }

    await save({
      user: principal,
      secret
    });

    if (ctx.accepts('html')) {
      ctx.redirect(303, continueUrl ?? `${principal.href}/auth-factor`);
    } else {
      ctx.status = 204;
    }
  }
}

export default new TOTPAddToUserController();
