import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as principalService from '../../principal/service';
import * as userService from '../service';

class UserPasswordController extends Controller {

  async put(ctx: Context) {

    ctx.privileges.require('admin');

    const userBody: any = ctx.request.body;
    const user = await principalService.findByExternalId(ctx.params.id, 'user');

    const password = userBody.newPassword;

    await userService.updatePassword(user, password);

    ctx.response.status = 204;

  }

}

export default new UserPasswordController();
