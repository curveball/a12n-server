import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest } from '@curveball/http-errors';
import * as privilegeService from '../../privilege/service';
import { PrivilegeMap } from '../../privilege/types';
import * as hal from '../formats/hal';
import * as userService from '../service';
// import * as groupService from '../../group/service';

class UserEditPrivilegesController extends Controller {

  async get(ctx: Context) {

    const user = await userService.findById(+ctx.params.id);
    const privileges = await privilegeService.getPrivilegesForPrincipal(user);

    await privilegeService.hasPrivilege(ctx, 'admin');

    ctx.response.body = hal.editPrivileges(
      user,
      privileges
    );

  }

  async post(ctx: Context) {

    const { policyBody }: any = ctx.request.body;

    const user = await userService.findById(+ctx.params.id);

    await privilegeService.hasPrivilege(ctx, 'admin');

    try {
        const policy = JSON.parse(policyBody) as PrivilegeMap;

        await privilegeService.replacePrivilegeForUser(user, policy);
    } catch (err) {
        throw new BadRequest(err);
    }

    ctx.redirect(303, `/user/${user.id}`);

  }

}

export default new UserEditPrivilegesController();
