import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

import { generateSecret, save } from '../service';
import { registrationForm } from '../formats/html';
import { User } from '../../../user/types';
import { getSetting } from '../../../server-settings';


class TOTPRegisterController extends Controller {
  async get(ctx: Context) {
    const user: User = ctx.state.session.registerUser;

    if (!user) {
      return ctx.redirect(303, '/login');
    }

    const secret = ctx.state.session.totpSecret ? ctx.state.session.totpSecret : generateSecret();
    ctx.state.session.totpSecret = secret;

    const otpauth = authenticator.keyuri(user.nickname, getSetting('totp.serviceName'), secret);

    const qrCode = await QRCode.toDataURL(otpauth);

    ctx.response.type = 'text/html';
    ctx.response.body = registrationForm(
      ctx.query.msg,
      ctx.query.error,
      secret,
      qrCode,
    );
  }

  async post(ctx: Context) {
    const user: User = ctx.state.session.registerUser;

    if (!user) {
      return ctx.redirect(303, '/login');
    }

    const { code } = ctx.request.body;
    const secret = ctx.state.session.totpSecret;
    const validCode = authenticator.check(code, secret);

    if (!validCode) {
      return ctx.redirect(303, '/register/mfa/totp?error=Invalid+token');
    }

    ctx.state.session.totpSecret = null;
    await save({
      user,
      secret
    });
    return ctx.redirect(303, '/login?msg=Registration+successful.+Please log in');
  }
}

export default new TOTPRegisterController();
