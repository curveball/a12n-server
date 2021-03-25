import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as UserService from '../service';
import { Forbidden } from '@curveball/http-errors';
import * as privilegeService from '../../privilege/service';

class UserPasswordController extends Controller {

  async put(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege may create new users');
    }

    const userBody: any = ctx.request.body;
    const user = await UserService.findById(parseInt(ctx.params.id, 10))

    if (user.type !== 'user') {
      throw new Forbidden('You can only update passwords for users');
    };

    const password = userBody.newPassword;

    await UserService.updatePassword(user, password);

    ctx.response.status = 204;

  }

}

export default new UserPasswordController();
