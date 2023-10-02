import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest, Conflict, NotFound } from '@curveball/http-errors';
import * as hal from '../formats/hal';
import { PrincipalService } from '../../principal/service';

type NewPrincipalBody = {
  nickname: string;
  active: boolean;
  type: 'user' | 'app' | 'group';
}

class GroupCollectionController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const groups = await principalService.findAll('group');
    ctx.response.body = hal.collection(groups);

  }

  async post(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);

    ctx.request.validate<NewPrincipalBody>(
      'https://curveballjs.org/schemas/a12nserver/principal-new.json'
    );

    const identity = ctx.request.links.get('me')?.href;
    if (!identity) {
      throw new BadRequest('You must specify a link with rel "me", either via a HAL link or HTTP Link header');
    }

    try {
      await principalService.findByIdentity(identity);
      throw new Conflict(`Principal with the identity ${identity} already exists`);
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }

    const group = await principalService.save({
      identity,
      nickname: ctx.request.body.nickname,
      type: ctx.request.body.type,
      active: ctx.request.body.active,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    ctx.response.status = 201;
    ctx.response.headers.set('Location', group.href);
  }

}

export default new GroupCollectionController();
