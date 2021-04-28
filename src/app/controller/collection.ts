import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Conflict, Forbidden, NotFound, UnprocessableEntity } from '@curveball/http-errors';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import * as principalService from '../../principal/service';
import { PrincipalTypeList } from '../../principal/types';

class AppCollectionController extends Controller {

  async get(ctx: Context) {

    const apps = await principalService.findAll('app');
    ctx.response.body = hal.collection(apps);

  }

  async post(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege may add new apps');
    }

    const userBody: any = ctx.request.body;

    try {
      await principalService.findByIdentity(userBody._links.me.href);
      throw new Conflict('User already exists');
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }

    if (typeof userBody.nickname !== 'string') {
      throw new UnprocessableEntity('nickname must be a string');
    }

    if (typeof userBody.active !== 'boolean') {
      throw new UnprocessableEntity('active must be a boolean');
    }

    if (!PrincipalTypeList.includes(userBody.type)) {
      throw new UnprocessableEntity('type must be one of ' + PrincipalTypeList.join(', '));
    }

    const user = await principalService.save(
      hal.halToModel(userBody)
    );

    ctx.response.status = 201;
    ctx.response.headers.set('Location', `/user/${user.id}`);
  }

}

export default new AppCollectionController();
