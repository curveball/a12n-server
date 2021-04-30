import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as userHal from '../formats/hal';
import * as appHal from '../../app/formats/hal';
import * as groupHal from '../../group/formats/hal';
import * as userService from '../service';
import * as principalService from '../../principal/service';
import * as groupService from '../../group/service';
import { Forbidden } from '@curveball/http-errors';

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

    const user = await principalService.findById(+ctx.params.id);

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

  async put(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege may edit users');
    }
    ctx.request.validate<EditPrincipalBody>(
      'https://curveballjs.org/schemas/a12nserver/principal-edit.json'
    );

    const user = await principalService.findById(+ctx.params.id);
    user.active = !!ctx.request.body.active;
    user.nickname = ctx.request.body.nickname;

    await principalService.save(user);
    ctx.status = 204;

  }


}

export default new UserController();
