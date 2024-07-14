import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest } from '@curveball/http-errors';
import * as hal from '../formats/hal.js';
import { PrincipalService } from '../../principal/service.js';

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

    const app = await principalService.save({
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
