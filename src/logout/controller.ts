import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { logoutForm } from './formats/html';

class LogoutController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = logoutForm(
      ctx.query.msg,
      ctx.query.error,
      ctx.query.continue,
    );

  }

  async post(ctx: Context) {

    ctx.state.session = null;
    ctx.state.sessionId = null;
    ctx.status = 303;
    ctx.redirect(
      303,
      ctx.query.continue || '/'
    );

  }

}

export default new LogoutController();
