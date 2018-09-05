import { Context, Middleware } from '@curveball/core';
import BaseController from '../base-controller';
import { loginForm } from './formats/html';

class LoginController extends BaseController {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = loginForm();

  }

  async post(ctx: Context) {

    console.log(ctx.request.body);

  }

}

function mw(): Middleware {
  const controller = new LoginController();
  return controller.dispatch.bind(controller);
}

export default mw();
