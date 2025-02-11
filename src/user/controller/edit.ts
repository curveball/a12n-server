import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal.ts';
import { PrincipalService } from '../../principal/service.ts';

class UserEditController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const user = await principalService.findByExternalId(ctx.params.id, 'user');

    ctx.privileges.require('admin');

    ctx.response.body = hal.edit(
      user,
    );

  }

  async post(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const userBody: any = ctx.request.body;
    const userOld = await principalService.findByExternalId(ctx.params.id);

    ctx.privileges.require('admin');

    const userUpdated = Object.assign({}, userOld, {
      ...userBody,
      active: userBody.active === 'true' ? true : false,
    });

    const user = await principalService.save(userUpdated);

    ctx.redirect(303, `/user/${user.id}`);

  }

}

export default new UserEditController();
