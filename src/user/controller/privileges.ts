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
type PrincipalPatchPrivilege = {
  action: 'add',
  resource: '*' | string,
  privilege: string
}

class UserEditPrivilegesController extends Controller {

  async get(ctx: Context) {

    const user = await principalService.findByExternalId(ctx.params.id);
    const userPrivileges = await privilegeService.getImmediatePrivilegesForPrincipal(user);
    const privileges = await privilegeService.findPrivileges();

    await privilegeService.hasPrivilege(ctx, 'admin');

    ctx.response.body = hal.editPrivileges(
      user,
      userPrivileges,
      privileges.map( privilege => privilege.privilege ),
    );

  }

  async post(ctx: Context<PolicyForm>) {

    const { policyBody } = ctx.request.body;

    const principal = await principalService.findByExternalId(ctx.params.id);
    await privilegeService.hasPrivilege(ctx, 'admin');

    try {
      const policy = JSON.parse(policyBody) as PrivilegeMap;

      await privilegeService.replacePrivilegeForUser(principal, policy);
    } catch (err: any) {
      throw new BadRequest(err);
    }

    ctx.redirect(303, principal.href);

  }


  async patch(ctx: Context) {

    ctx.request.validate<PrincipalPatchPrivilege>('https://curveballjs.org/schemas/a12nserver/principal-patch-privilege.json');
    const principal = await principalService.findByExternalId(ctx.params.id);
    await privilegeService.hasPrivilege(ctx, 'admin');

    await privilegeService.addPrivilegeForUser(
      principal,
      ctx.request.body.privilege,
      ctx.request.body.resource,
    );

    ctx.status = 200;
    ctx.response.body = {
      _links: {
        principal: {
          href: principal.href,
          title: principal.nickname,
        },
        up: {
          href: `${principal.href}/edit/privileges`,
          title: 'Back to privileges',
        }
      },
      title: 'Privileges updated',
    };

  }
}

export default new UserEditPrivilegesController();
