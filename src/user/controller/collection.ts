import { Context, Middleware } from '@curveball/core';
import BaseController from '../../base-controller';
import * as usersService from '../service';
import * as hal from '../formats/hal';

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
