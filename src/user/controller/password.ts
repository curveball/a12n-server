import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as UserService from '../service';
import { Forbidden, Unauthorized, NotFound } from '@curveball/http-errors';
import { User } from '../types';
import * as privilegeService from '../../privilege/service';

class UserPasswordController extends Controller {

  async put(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege may create new users');
    }

    const userBody: any = ctx.request.body;

    let user: User;
    try {
      user = await UserService.findByIdentity('mailto:' + userBody.identity) as User;
    } catch (err) {
      if (err instanceof NotFound) {
        throw new NotFound('User email doesn\'t exist');
      } else {
        throw err;
      }
    }

    const userNewPassword = userBody.newPassword;
    const confirmNewPassword = userBody.confirmNewPassword;


    if (userNewPassword !== confirmNewPassword) {
      throw new Unauthorized('New password mismatch, please try again');
    }

    await UserService.updatePassword(user, userNewPassword);

    ctx.response.status = 201;
    ctx.response.headers.set('Location', `/user/${user.id}`);

  }

}

export default new UserPasswordController();
