import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as UserService from '../service';
import { Forbidden } from '@curveball/http-errors';
import { User } from '../types';
import * as privilegeService from '../../privilege/service';

class UserPasswordController extends Controller {

  async put(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege may create new users');
    }

    const userBody: any = ctx.request.body;
    const user = await UserService.findByHref(ctx.params.href) as User;
    const userNewPassword = userBody.newPassword;

    await UserService.updatePassword(user, userNewPassword);

    return ctx.redirect(303, `/user/${user.id}`);

  }

}

export default new UserPasswordController();
