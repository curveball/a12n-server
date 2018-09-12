import { Context, Middleware } from '@curveball/core';
import BaseController from '../../base-controller';
import * as hal from '../formats/hal';
import * as userService from '../service';
import * as permissionService from '../../permission/service';

class UserController extends BaseController {

  async get(ctx: Context) {

    const user = await userService.findById(ctx.state.params.id);
    ctx.response.body = hal.item(
      user,
      await permissionService.getPermissionsForUser(user)
    );

  }

}

function mw(): Middleware {
  const controller = new UserController();
  return controller.dispatch.bind(controller);
}

export default mw();
