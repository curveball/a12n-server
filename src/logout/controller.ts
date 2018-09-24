import { Context, Middleware } from '@curveball/core';
import BaseController from '../base-controller';
import { logoutForm } from './formats/html';

class LogoutController extends BaseController {

  async get(ctx: Context) {

    console.log(ctx.state.session);
    ctx.response.type = 'text/html';
    ctx.response.body = logoutForm(ctx.query.msg);

  }

  async post(ctx: Context) {

    ctx.state.session = null;
    ctx.state.sessionId = null;
    ctx.status = 303;
    ctx.response.headers.set('Location', '/');

  }

}

function mw(): Middleware {
  const controller = new LogoutController();
  return controller.dispatch.bind(controller);
}

export default mw();
