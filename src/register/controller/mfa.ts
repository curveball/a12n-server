import Controller from '@curveball/controller';
import { Context } from '@curveball/core';

import { mfaRegistrationForm } from '../formats/html';

import { User } from '../../user/types';


class MFAController extends Controller {

  async get(ctx: Context) {
    const user: User = ctx.state.session.registerUser;

    if (!user) {
      ctx.redirect(303, '/login');
      return;
    }

    ctx.response.type = 'text/html';
    ctx.response.body = mfaRegistrationForm(ctx.query.msg, ctx.query.error);
  }

}

export default new MFAController();
