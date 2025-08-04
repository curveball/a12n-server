import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { clearSession } from '../login/utilities.ts';
import * as oauth2Service from '../oauth2/service.ts';
import { logoutForm } from './formats/html.ts';

class LogoutController extends Controller {

  get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = logoutForm(
      ctx.query.msg,
      ctx.query.error,
      ctx.query.continue,
    );

  }

  async post(ctx: Context<any>) {

    await oauth2Service.invalidateTokensByBrowserSessionId(
      ctx.sessionId!
    );
    clearSession(ctx);
    ctx.status = 303;
    ctx.redirect(
      303,
      ctx.request.body.continue || '/'
    );
  }

}

export default new LogoutController();
