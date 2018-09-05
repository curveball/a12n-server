import { Context, Middleware } from '@curveball/core';
import BaseController from '../../base-controller';
import * as hal from '../formats/hal';
import * as usersService from '../service';

class UserCollectionController extends BaseController {

  async get(ctx: Context) {

    const users = await usersService.findAll();
    ctx.response.body = hal.collection(users);

  }

}

function mw(): Middleware {
  const controller = new UserCollectionController();
  return controller.dispatch.bind(controller);
}

export default mw();
