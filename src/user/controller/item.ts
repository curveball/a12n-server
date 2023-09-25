import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as userHal from '../formats/hal';
import * as appHal from '../../app/formats/hal';
import * as groupHal from '../../group/formats/hal';
import * as userService from '../service';
import * as groupService from '../../group/service';
import { PrincipalService } from '../../principal/privileged-service';

type EditPrincipalBody = {
  nickname: string;
  active: boolean;
  type: 'user' | 'app' | 'group';

  /**
   * We don't care about the below types yet.
   *
   * In the future we will auto-generate _good_ types from the schemas
   * and then all of this will be cleaned up
   */
  createdAt?: unknown;
  modifiedAt?: unknown;
  privileges?: unknown;
}

class UserController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id);

    let hasControl = false;
    let hasPassword = false;
    const isAdmin = ctx.privileges.has('admin');

    if (ctx.auth.equals(principal)) {
      hasControl = true;
    } else if (isAdmin) {
      hasControl = true;
    }

    if (hasControl && principal.type === 'user') {
      hasPassword = await userService.hasPassword(principal);
    }

    const principalPrivileges = await privilegeService.get(principal);
    // This endpoint supports rendering groups and apps, for backwards
    // compatibility. This will be removed in the future
    switch(principal.type) {
      case 'user' :
        ctx.response.body = userHal.item(
          principal,
          principalPrivileges.getAll(),
          hasControl,
          hasPassword,
          isAdmin,
          await groupService.findGroupsForPrincipal(principal),
        );
        break;
      case 'group' : {
        const members = await groupService.findMembers(principal);
        ctx.response.body = groupHal.item(
          principal,
          principalPrivileges.getAll(),
          isAdmin,
          await groupService.findGroupsForPrincipal(principal),
          members,
        );
        break;
      }
      case 'app' :
        ctx.response.body = appHal.item(
          principal,
          principalPrivileges.getAll(),
          isAdmin,
          await groupService.findGroupsForPrincipal(principal),
        );
        break;
    }

  }

  async put(ctx: Context) {

    ctx.request.validate<EditPrincipalBody>(
      'https://curveballjs.org/schemas/a12nserver/principal-edit.json'
    );
    const principalService = new PrincipalService(ctx.privileges);

    const user = await principalService.findByExternalId(ctx.params.id);
    user.active = !!ctx.request.body.active;
    user.nickname = ctx.request.body.nickname;

    await principalService.save(user);
    ctx.status = 204;

  }


}

export default new UserController();
