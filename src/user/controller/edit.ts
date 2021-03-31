import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import * as userService from '../service';
// import * as groupService from '../../group/service';

class UserEditController extends Controller {

  async get(ctx: Context) {

    const user = await userService.findById(+ctx.params.id);

    await privilegeService.hasPrivilege(ctx, 'admin');

    ctx.response.body = hal.edit(
      user,
    );

  }

  async post(ctx: Context) {

    const userBody: any = ctx.request.body;
    const userOld = await userService.findById(+ctx.params.id);

    await privilegeService.hasPrivilege(ctx, 'admin');

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
