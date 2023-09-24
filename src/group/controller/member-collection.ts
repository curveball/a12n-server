import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as userService from '../../principal/service';
import * as hal from '../formats/hal';
import * as groupService from '../service';
import { Conflict, NotFound, UnprocessableEntity } from '@curveball/http-errors';

class GroupMemberCollectionController extends Controller {

  async get(ctx: Context) {

    const user = await userService.findById(+ctx.params.id, 'group');

    const members = await groupService.findMembers(user);
    ctx.response.body = hal.memberCollection(user, members);

  }

  /**
   * PUT replaces the member list.
   *
   * Members must be supplied with the 'item' link.
   */
  async put(ctx: Context) {

    const group = await userService.findById(+ctx.params.id, 'group');
    ctx.privileges.require('admin');

    if (!ctx.request.links.has('item')) {
      throw new UnprocessableEntity('"item" link relationship not found');
    }
    const newMemberLinks = ctx.request.links.getMany('item');

    const newMembers = await Promise.all(
      newMemberLinks.map( async link => {
        try {
          return userService.findByHref(link.href);
        } catch (err) {
          throw new Conflict(`User with href ${link.href} not found`);
        }
      })
    );

    await groupService.replaceMembers(group, newMembers);
    ctx.status = 204;

  }

  /**
   * The POST request here is a simpler rpc-like API to add a new member to the group..
   */
  async post(ctx: Context<any>) {

    const group = await userService.findById(+ctx.params.id, 'group');
    ctx.privileges.require('admin');

    if (ctx.request.body.operation === undefined) {
      throw new UnprocessableEntity('You must specify an "operation" property');
    }
    if (ctx.request.body.operation !== 'add-member') {
      throw new UnprocessableEntity('"operation" must be set to "add-member"');
    }
    if (ctx.request.body.memberHref === undefined) {
      throw new UnprocessableEntity('The "memberHref" property must be set, and must point to the member you are adding to the group.');
    }

    const newMemberHref = ctx.request.body.memberHref;
    let newMember;

    try {
      newMember = await userService.findByHref(newMemberHref);
    } catch (err) {
      if (err instanceof NotFound) {
        throw new Conflict(`User with href ${newMemberHref} not found`);
      } else {
        throw err;
      }
    }

    await groupService.addMember(group, newMember);
    ctx.status = 204;

  }


}

export default new GroupMemberCollectionController();
