import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as UserService from '../service';
import { Forbidden } from '@curveball/http-errors';
import * as privilegeService from '../../privilege/service';
import log from '../../log/service';
import { EventType } from '../../log/types';

class UserPasswordController extends Controller {

  async post(ctx: Context<any>) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege may create new password');
    }

    const user = await UserService.findById(parseInt(ctx.params.id, 10));
    const userNewPassword = ctx.request.body.newPassword;

    if (user.type !== 'user') {
      throw new Forbidden('You can only create passwords for users');
    }

    await UserService.createPassword(user, userNewPassword);

    ctx.session = {
      user: user,
    };
    log(EventType.changePasswordSuccess, ctx);
    ctx.status = 303;
    ctx.response.headers.set('Location', `/user/${user.id}`);

  }

  async put(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege may create new users');
    }

    const userBody: any = ctx.request.body;
    const user = await UserService.findById(parseInt(ctx.params.id, 10));

    if (user.type !== 'user') {
      throw new Forbidden('You can only update passwords for users');
    }

    const password = userBody.newPassword;

    await UserService.updatePassword(user, password);

    ctx.response.status = 204;

  }

}

export default new UserPasswordController();
