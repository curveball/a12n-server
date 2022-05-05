import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest } from '@curveball/http-errors';
import * as privilegeService from '../../privilege/service';
import { PrivilegeMap } from '../../privilege/types';
import * as hal from '../formats/hal';
import * as principalService from '../../principal/service';
// import * as groupService from '../../group/service';

type PolicyForm = {
  policyBody: string;
}

class UserEditPrivilegesController extends Controller {

  async get(ctx: Context) {

    const user = await principalService.findByExternalId(ctx.params.id);
    const privileges = await privilegeService.getImmediatePrivilegesForPrincipal(user);

    await privilegeService.hasPrivilege(ctx, 'admin');

    ctx.response.body = hal.editPrivileges(
      user,
      privileges
    );

  }

  async post(ctx: Context<PolicyForm>) {

    const { policyBody } = ctx.request.body;

    const user = await principalService.findByExternalId(ctx.params.id);
    await privilegeService.hasPrivilege(ctx, 'admin');

    try {
      const policy = JSON.parse(policyBody) as PrivilegeMap;

      await privilegeService.replacePrivilegeForUser(user, policy);
    } catch (err: any) {
      throw new BadRequest(err);
    }

    ctx.redirect(303, `/user/${user.id}`);

  }

}

export default new UserEditPrivilegesController();
