import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest } from '@curveball/http-errors/dist';
import * as userService from '../../user/service';
import * as hal from '../formats/hal';
import * as groupService from '../service';
import { Conflict, NotFound } from '@curveball/http-errors';

class GroupMemberCollectionController extends Controller {
  async get(ctx: Context) {

    const user = await userService.findById(parseInt(ctx.state.params.id, 10));

    /**
     * Checks if user type is a group
     */
    if (!groupService.isGroup(user)) {
      throw new BadRequest('This endpoint only exists for groups');
    }

    const members = await groupService.findAllGroupMembers(user);
    ctx.response.body = hal.collection(user, members);
  }

  async post(ctx: Context) {

    const group = await userService.findById(parseInt(ctx.state.params.id, 10));

    if (!groupService.isGroup(group)) {
      throw new BadRequest('This endpoint only exists for groups');
    }

    const userBody: any = ctx.request.body;

    try {
      await groupService.findByUserId(parseInt(userBody.userId, 10));
      throw new Conflict('User already part of this group');
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }

    await groupService.save(userBody.userId, group);

    ctx.response.status = 201;
    ctx.response.headers.set('Location', '/user/' + group.id + '/member');
  }


}

export default new GroupMemberCollectionController();
