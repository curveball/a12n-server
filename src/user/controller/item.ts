import { Context } from '@curveball/core';
import Controller from '@curveball/controller';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import * as userService from '../service';

class UserController extends Controller {

  async get(ctx: Context) {

    const user = await userService.findById(ctx.state.params.id);
    ctx.response.body = hal.item(
      user,
      await privilegeService.getPrivilegesForUser(user)
    );

  }

}

export default new UserController();
