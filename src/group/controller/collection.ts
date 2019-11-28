import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest } from '@curveball/http-errors/dist';
import * as userService from '../../user/service';
import * as hal from '../formats/hal';
import * as groupService from '../service';

class GroupMemberCollectionControlller extends Controller {
  async get(ctx: Context) {

    const user = await userService.findById(parseInt(ctx.state.params.id, 10));

    /**
     * Checks if user type is a group
     */
    const group = await groupService.isGroup(user);

    if (!group) {
      throw new BadRequest('User must be a group to gain access');
    }

    const members = await groupService.findAllGroupMembers(user);
    ctx.response.body = hal.collection(user, members);
  }

}

export default new GroupMemberCollectionControlller();
