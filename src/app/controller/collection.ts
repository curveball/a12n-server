import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest, Conflict, NotFound, UnprocessableEntity } from '@curveball/http-errors';
import * as hal from '../formats/hal';
import { PrincipalService } from '../../principal/privileged-service';

type NewPrincipalBody = {
  nickname: string;
  active: boolean;
  type: 'user' | 'app' | 'group';
}

class UserCollectionController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const apps = await principalService.findAll('app');
    ctx.response.body = hal.collection(apps);

  }

  async post(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);

    ctx.request.validate<NewPrincipalBody>(
      'https://curveballjs.org/schemas/a12nserver/new-principal.json'
    );

    if (ctx.request.body.type !== 'app') {
      throw new BadRequest('You may only create principals with type "app" at this endpoint');
    }

    const identity = ctx.request.links.get('me')?.href;
    if (!identity) {
      throw new UnprocessableEntity('You must specify a link with rel "me", either via a HAL link or HTTP Link header');
    }

    try {
      await principalService.findByIdentity(identity);
      throw new Conflict('Principal already exists');
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }

    const app = await principalService.save({
      identity,
      nickname: ctx.request.body.nickname,
      type: 'app',
      active: ctx.request.body.active,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    ctx.response.status = 201;
    ctx.response.headers.set('Location', app.href);
  }

}

export default new UserCollectionController();
