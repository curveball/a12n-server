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

    const principal = await principalService.findByHref(decodeURIComponent(ctx.params.href));

    let hasControl = false;
    let hasPassword = false;
    const isAdmin = await privilegeService.hasPrivilege(ctx, 'admin');

    if (ctx.state.user.id === principal.id) {
      hasControl = true;
    } else if (isAdmin) {
      hasControl = true;
    }

    if (hasControl && principal.type === 'user') {
      hasPassword = await userService.hasPassword(principal);
    }

    // This endpoint supports rendering groups and apps, for backwards
    // compatibility. This will be removed in the future
    switch(principal.type) {
      case 'user' :
        ctx.response.body = userHal.item(
          principal,
          await privilegeService.getPrivilegesForPrincipal(principal),
          hasControl,
          hasPassword,
          isAdmin,
          await groupService.findGroupsForPrincipal(principal),
        );
        ctx.redirect(303, principal.href);
        break;
      case 'group' : {
        const members = await groupService.findMembers(principal);
        ctx.response.body = groupHal.item(
          principal,
          await privilegeService.getPrivilegesForPrincipal(principal),
          isAdmin,
          await groupService.findGroupsForPrincipal(principal),
          members,
        );
        break;
      }
      case 'app' :
        ctx.response.body = appHal.item(
          principal,
          await privilegeService.getPrivilegesForPrincipal(principal),
          isAdmin,
          await groupService.findGroupsForPrincipal(principal),
        );
        break;
    }

  }

}

export default new UserByHrefController();
