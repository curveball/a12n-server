import { Context } from '@curveball/core';
import Controller from '@curveball/controller';
import * as hal from '../formats/hal';
import * as usersService from '../service';

class UserCollectionController extends Controller {

  async get(ctx: Context) {

    const users = await usersService.findAll();
    ctx.response.body = hal.collection(users);

  }

}

export default new UserCollectionController();
