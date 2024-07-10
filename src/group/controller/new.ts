import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { PrincipalService } from '../../principal/service.js';
import { createGroupForm } from '../formats/html.js';
import { uuidUrn } from '../../crypto.js';

type GroupNewForm = {
  nickname: string;
}

class CreateGroupController extends Controller {

  async get(ctx: Context) {

    ctx.privileges.require('admin');
    ctx.response.type = 'text/html';
    ctx.response.body = createGroupForm({
      csrfToken: await ctx.getCsrf(),
      msg: ctx.query.msg,
      error: ctx.query.error
    });
  }

  async post(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    ctx.request.validate<GroupNewForm>('https://curveballjs.org/schemas/a12nserver/group-new-form.json');

    ctx.privileges.require('admin');

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
