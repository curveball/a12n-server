import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import * as principalService from '../../principal/service';
import * as userService from '../service';
import * as groupService from '../../group/service';

class UserByHrefController extends Controller {

  async get(ctx: Context) {

    const user = await principalService.findByHref(decodeURIComponent(ctx.params.href));

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

}

export default new UserByHrefController();
