import { Context, Middleware } from '@curveball/core';
import BaseController from '../base-controller';

class HealthController extends BaseController {

  get(ctx: Context) {

    ctx.response.body = {};

  }

}

function mw(): Middleware {
  const controller = new HealthController();
  return controller.dispatch.bind(controller);
}

export default mw();
