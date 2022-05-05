import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';
import * as privilegeService from '../../privilege/service';
import * as principalService from '../../principal/service';
import { createGroupForm } from '../formats/html';
import { uuidUrn } from '../../crypto';

type GroupNewForm = {
  nickname: string;
}

class CreateGroupController extends Controller {

  async get(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can create new users');
    }
    ctx.response.type = 'text/html';
    ctx.response.body = createGroupForm(ctx.query.msg, ctx.query.error);
  }

  async post(ctx: Context) {

    ctx.request.validate<GroupNewForm>('https://curveballjs.org/schemas/a12nserver/group-new-form.json');

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can create new users');
    }

    const nickname = ctx.request.body.nickname;

    const newGroup = await principalService.save({
      type: 'group',
      nickname,
      active: true,
      identity: uuidUrn(),
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    ctx.response.status = 303;
    ctx.response.headers.set('Location', newGroup.href);

  }

}

export default new CreateGroupController();
