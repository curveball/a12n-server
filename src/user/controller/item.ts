import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import * as userService from '../service';
import * as groupService from '../../group/service';
import { Forbidden } from '@curveball/http-errors';

class UserController extends Controller {

  async get(ctx: Context) {

    const user = await userService.findById(+ctx.params.id);

    let hasControl = false;
    let hasPassword = false;
    const isAdmin = await privilegeService.hasPrivilege(ctx, 'admin');

    if (ctx.state.user.id === user.id) {
      hasControl = true;
    } else if (isAdmin) {
      hasControl = true;
    }

    if (hasControl && user.type === 'user') {
      hasPassword = await userService.hasPassword(user);
    }

    ctx.response.body = hal.item(
      user,
      await privilegeService.getPrivilegesForPrincipal(user),
      hasControl,
      hasPassword,
      isAdmin,
      await groupService.findGroupsForPrincipal(user),
    );

  }

  async put(ctx: Context<any>) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege may edit users');
    }

    const user = await userService.findById(+ctx.params.id);
    user.active = !!ctx.request.body.active;
    user.nickname = ctx.request.body.nickname;

    await userService.save(user);
    ctx.status = 204;

  }


}

export default new UserController();
