import Controller from '@curveball/controller';
import { Context } from '@curveball/core';

import { mfaRegistrationForm } from '../formats/html';


class MFAController extends Controller {

  async get(ctx: Context) {
    ctx.response.type = 'text/html';
    ctx.response.body = mfaRegistrationForm(ctx.query.msg, ctx.query.error);
  }

}

export default new MFAController();
