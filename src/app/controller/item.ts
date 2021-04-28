import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import * as principalService from '../../principal/service';
import * as groupService from '../../group/service';
import { Forbidden } from '@curveball/http-errors';

class UserController extends Controller {

  async get(ctx: Context) {

    const app = await principalService.findById(+ctx.params.id, 'app');

    const isAdmin = await privilegeService.hasPrivilege(ctx, 'admin');

    ctx.response.body = hal.item(
      app,
      await privilegeService.getPrivilegesForPrincipal(app),
      isAdmin,
      await groupService.findGroupsForPrincipal(app),
    );

  }

  async put(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege may edit users');
    }

    const user = await principalService.findById(+ctx.params.id);
    user.active = !!ctx.request.body.active;
    user.nickname = ctx.request.body.nickname;

    await principalService.save(user);
    ctx.status = 204;

  }


}

export default new UserController();
