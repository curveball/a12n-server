import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal.ts';
import { PrincipalService } from '../../principal/service.ts';
import { PrincipalNew } from '../../api-types.ts';

class GroupCollectionController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const groups = await principalService.findAll('group');
    ctx.response.body = hal.collection(groups);

  }

  async post(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);

    ctx.request.validate<PrincipalNew>(
      'https://curveballjs.org/schemas/a12nserver/principal-new.json'
    );

    const group = await principalService.save({
      nickname: ctx.request.body.nickname,
      type: ctx.request.body.type,
      active: true,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    ctx.response.status = 201;
    ctx.response.headers.set('Location', group.href);
  }

}

export default new GroupCollectionController();
