import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest } from '@curveball/http-errors';
import * as userService from '../../user/service';
// import * as hal from '../formats/hal';
import * as groupService from '../service';
import { addUserToGroupMemberForm } from '../formats/html';

class GroupMemberCollectionController extends Controller {
  async get(ctx: Context) {

    const group = await userService.findById(parseInt(ctx.state.params.id, 10));

    if (!groupService.isGroup(group)) {
      throw new BadRequest('User must be a group to gain access!!');
    }
    ctx.response.type = 'text/html';
    ctx.response.body = addUserToGroupMemberForm(group, ctx.query.msg, ctx.query.error);


  }

  async post(ctx: Context) {

    const group = await userService.findById(parseInt(ctx.state.params.id, 10));

    if (!groupService.isGroup(group)) {
      throw new BadRequest('User must be a group to gain access!!');
    }

    const userId = ctx.request.body.userId;

    await groupService.save(userId, group);

    ctx.response.status = 303;
    ctx.response.headers.set('Location', '/user/' + group.id + '/member');
  }

}

export default new GroupMemberCollectionController();
