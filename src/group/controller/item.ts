import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import * as principalService from '../../principal/service';
import * as groupService from '../../group/service';
import { Forbidden, NotFound, Conflict } from '@curveball/http-errors';

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

type GroupPatch = {
  operation: 'add-member' | 'remove-member';
  memberHref: string;
};

class GroupController extends Controller {

  async get(ctx: Context) {

    const group = await principalService.findByExternalId(ctx.params.id, 'group');
    const isAdmin = await privilegeService.hasPrivilege(ctx, 'admin');
    const members = await groupService.findMembers(group);

    ctx.response.body = hal.item(
      group,
      await privilegeService.getPrivilegesForPrincipal(group),
      isAdmin,
      await groupService.findGroupsForPrincipal(group),
      members,
    );

  }

  async put(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege may edit users');
    }
    ctx.request.validate<EditPrincipalBody>(
      'https://curveballjs.org/schemas/a12nserver/principal-edit.json'
    );

    const user = await principalService.findByExternalId(ctx.params.id, 'group');
    user.active = !!ctx.request.body.active;
    user.nickname = ctx.request.body.nickname;

    await principalService.save(user);
    ctx.status = 204;

  }

  /**
   * The POST request here is a simpler rpc-like API to add or remove members
   * from a group.
   */
  async patch(ctx: Context) {

    delete (ctx.request.body as any)['csrf-token'];

    ctx.request.validate<GroupPatch>('https://curveballjs.org/schemas/a12nserver/group-patch.json');
    const group = await principalService.findByExternalId(ctx.params.id, 'group');

    const memberHref = ctx.request.body.memberHref;
    let member;

    try {
      member = await principalService.findByHref(memberHref);
    } catch (err) {
      if (err instanceof NotFound) {
        throw new Conflict(`User with href ${memberHref} not found`);
      } else {
        throw err;
      }
    }

    switch (ctx.request.body.operation) {
      case 'add-member':
        await groupService.addMember(group, member);
        break;
      case 'remove-member':
        await groupService.removeMember(group, member);
        break;
    }

    if (ctx.request.accepts('text/html')) {
      const group = await principalService.findByExternalId(ctx.params.id, 'group');
      const isAdmin = await privilegeService.hasPrivilege(ctx, 'admin');
      const members = await groupService.findMembers(group);

      ctx.response.body = hal.item(
        group,
        await privilegeService.getPrivilegesForPrincipal(group),
        isAdmin,
        await groupService.findGroupsForPrincipal(group),
        members,
      );
      ctx.redirect(200, group.href);
    } else {
      ctx.status = 204;
    }

  }


}

export default new GroupController();
