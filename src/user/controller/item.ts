import { Context, Middleware } from '@curveball/core';
import BaseController from '../../base-controller';
import * as hal from '../formats/hal';
import * as usersService from '../service';

class UserController extends BaseController {

  async get(ctx: Context) {

    const user = await usersService.findById(ctx.state.params.id);
    ctx.response.body = hal.item(user);

  }

}

function mw(): Middleware {
  const controller = new UserController();
  return controller.dispatch.bind(controller);
}

export default mw();
