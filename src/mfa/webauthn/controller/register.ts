import Controller from '@curveball/controller';
import { Context } from '@curveball/core';

import { registrationForm } from '../formats/html';
import { User } from '../../../user/types';


class WebAuthnRegisterController extends Controller {
  async get(ctx: Context) {
    //const user: User = ctx.state.session.registerUser;
    const user: User = {
      id: 25,
      identity: 'mailto:b@b',
      nickname: 'b',
      created: new Date(1),
      active: false,
      type: 'user',
    };

    if (!user) {
      ctx.response.status = 303;
      ctx.response.headers.set('Location', '/login');
      return;
    }

    ctx.response.type = 'text/html';
    ctx.response.body = registrationForm(
      ctx.query.msg,
      ctx.query.error,
    );
  }
}

export default new WebAuthnRegisterController();