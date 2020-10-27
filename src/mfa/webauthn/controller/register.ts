import Controller from '@curveball/controller';
import { Context } from '@curveball/core';

import { registrationForm } from '../formats/html';
import { User } from '../../../user/types';


class WebAuthnRegisterController extends Controller {
  async get(ctx: Context) {
    const user: User = ctx.state.session.registerUser;

    if (!user) {
      return ctx.redirect(303, '/login');
    }

    ctx.response.type = 'text/html';
    ctx.response.body = registrationForm(
      ctx.query.msg,
      ctx.query.error,
    );
  }
}

export default new WebAuthnRegisterController();
