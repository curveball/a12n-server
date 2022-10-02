import Controller from '@curveball/controller';
import { Context } from '@curveball/core';

import { mfaRegistrationForm } from '../formats/html';

import { getSetting } from '../../server-settings';
import { User } from '../../types';


class MFAController extends Controller {

  async get(ctx: Context) {
    const user: User = ctx.session.registerUser;

    if (!user) {
      return ctx.redirect(303, '/login');
    }

    ctx.response.type = 'text/html';
    ctx.response.body = mfaRegistrationForm(
      ctx.query.msg,
      ctx.query.error,
      getSetting('totp') !== 'disabled',
      getSetting('webauthn') !== 'disabled',
    );
  }

  async post(ctx: Context<any>) {
    const { mfaDevice } = ctx.request.body;

    if (mfaDevice === 'totp') {
      return ctx.redirect(303, '/register/mfa/totp');
    } else if (mfaDevice === 'yubikey') {
      return ctx.redirect(303, '/register/mfa/webauthn');
    }

    return ctx.redirect(303, '/register/mfa?error=Unknown MFA device');
  }

}

export default new MFAController();
