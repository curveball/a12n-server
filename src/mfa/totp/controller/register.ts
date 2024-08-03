import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { authenticator } from 'otplib';
import { generateSecret, generateTotpQrcode, save } from '../service.js';
import { registrationForm } from '../formats/html.js';
import { User } from '../../../types.js';


class TOTPRegisterController extends Controller {
  async get(ctx: Context) {
    const user: User = ctx.session.registerUser;

    if (!user) {
      return ctx.redirect(303, '/login');
    }

    const secret = ctx.session.totpSecret ? ctx.session.totpSecret : generateSecret();
    ctx.session.totpSecret = secret;

    const qrCode = await generateTotpQrcode(user, secret);

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

  async post(ctx: Context<any>) {
    const user: User = ctx.session.registerUser;

    if (!user) {
      return ctx.redirect(303, '/login');
    }

    const { code } = ctx.request.body;
    const secret = ctx.session.totpSecret;
    const validCode = authenticator.check(code, secret);

    if (!validCode) {
      return ctx.redirect(303, '/register/mfa/totp?error=Invalid+token');
    }

    ctx.session.totpSecret = null;
    await save({
      user,
      secret
    });
    if (ctx.session.registerContinueUrl) {
      delete ctx.session.registerContinueUrl;
      return ctx.redirect(303, ctx.session.registerContinueUrl);
    } else {
      return ctx.redirect(303, '/login?msg=Registration+successful.+Please log in');
    }
  }
}

export default new TOTPRegisterController();
