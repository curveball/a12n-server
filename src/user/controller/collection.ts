import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest, Conflict, Forbidden, NotFound } from '@curveball/http-errors';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import * as principalService from '../../principal/service';

type NewPrincipalBody = {
  nickname: string;
  active: boolean;
  type: 'user' | 'app' | 'group';
}

class UserCollectionController extends Controller {

  async get(ctx: Context) {

    const users = await principalService.findAll('user');
    ctx.response.body = hal.collection(users);

  }

  async post(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege may create new users');
    }

    ctx.request.validate<NewPrincipalBody>(
      'https://curveballjs.org/schemas/a12nserver/principal-new.json'
    );

    const identity = ctx.request.links.get('me')?.href;
    if (!identity) {
      throw new BadRequest('You must specify a link with rel "me", either via a HAL link or HTTP Link header');
    }

    try {
      await principalService.findByIdentity(identity);
      throw new Conflict('User already exists');
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }

    const user = await principalService.save({
      identity,
      nickname: ctx.request.body.nickname,
      type: ctx.request.body.type,
      active: ctx.request.body.active,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    ctx.response.status = 201;
    ctx.response.headers.set('Location', `/user/${user.id}`);
  }

}

export default new UserCollectionController();
