import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import * as userService from '../service';

class UserController extends Controller {

  async get(ctx: Context) {

    const user = await userService.findById(+ctx.params.id);
    ctx.response.body = hal.item(
      user,
      await privilegeService.getPrivilegesForUser(user)
    );

  }

}

export default new UserController();
