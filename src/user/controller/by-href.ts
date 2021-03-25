import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import * as userService from '../service';
import * as groupService from '../../group/service';

class UserByHrefController extends Controller {

  async get(ctx: Context) {

    const user = await userService.findByHref(ctx.params.href);

    let hasControl = false;
    let hasPassword = false;
    let hasPrivilege = false;
    if (ctx.state.user.id === user.id) {
      hasControl = true;
    } else if (await privilegeService.hasPrivilege(ctx, 'admin')) {
      hasControl = true;
    }
    if (hasControl && user.type === 'user') {
      hasPassword = await userService.hasPassword(user);
    }
    if (privilegeService.hasPrivilege(user, 'admin', '*')) {
      hasPrivilege = true;
    }

    ctx.response.body = hal.item(
      user,
      await privilegeService.getPrivilegesForPrincipal(user),
      hasControl,
      hasPassword,
      hasPrivilege,
      await groupService.findGroupsForPrincipal(user),
    );

  }

}

export default new UserByHrefController();
