import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as userHal from '../formats/hal';
import * as appHal from '../../app/formats/hal';
import * as groupHal from '../../group/formats/hal';
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

    // This endpoint supports rendering groups and apps, for backwards
    // compatibility. This will be removed in the future
    switch(user.type) {
      case 'user' :
        ctx.response.body = userHal.item(
          user,
          await privilegeService.getPrivilegesForPrincipal(user),
          hasControl,
          hasPassword,
          isAdmin,
          await groupService.findGroupsForPrincipal(user),
        );
        break;
      case 'group' :
        ctx.response.body = groupHal.item(
          user,
          await privilegeService.getPrivilegesForPrincipal(user),
          isAdmin,
          await groupService.findGroupsForPrincipal(user),
        );
        break;
      case 'app' :
        ctx.response.body = appHal.item(
          user,
          await privilegeService.getPrivilegesForPrincipal(user),
          isAdmin,
          await groupService.findGroupsForPrincipal(user),
        );
        break;
    }

  }

}

export default new UserByHrefController();
