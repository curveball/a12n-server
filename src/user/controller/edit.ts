import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import * as userService from '../service';
import { Forbidden } from '@curveball/http-errors';

class UserEditController extends Controller {

  async get(ctx: Context) {

    const user = await userService.findById(+ctx.params.id);

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege use this endpoint');
    }

    ctx.response.body = hal.edit(
      user,
    );

  }

  async post(ctx: Context) {

    const userBody: any = ctx.request.body;
    const userOld = await userService.findById(+ctx.params.id);

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege use this endpoint');
    }

    delete userBody['csrf-token'];

    const userUpdated = Object.assign({}, userOld, {
      ...userBody,
      active: userBody.active === 'true' ? true : false,
    });

    const user = await userService.save(userUpdated);

    ctx.redirect(303, `/user/${user.id}`);

  }

}

export default new UserEditController();
