import { Context, Middleware } from '@curveball/core';
import BaseController from '../base-controller';
import hal from './formats/hal';

class HomeController extends BaseController {

  get(ctx: Context) {

    const version = require('../../package.json').version;
    ctx.response.body = hal(version);

  }

}

function mw(): Middleware {
  const controller = new HomeController();
  return controller.dispatch.bind(controller);
}

export default mw();
