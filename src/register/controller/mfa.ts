import Controller from '@curveball/controller';
import { Context } from '@curveball/core';

import { mfaRegistrationForm } from '../formats/html';

import { getSetting } from '../../server-settings';
import { User } from '../../user/types';


class MFAController extends Controller {

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
    ctx.response.body = mfaRegistrationForm(
      ctx.query.msg,
      ctx.query.error,
      getSetting('totp') !== 'disabled',
      getSetting('webauthn') !== 'disabled',
    );
  }

}

export default new MFAController();