import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { PrincipalService } from '../../principal/service';
import * as userService from '../service';
import { UnprocessableEntity } from '@curveball/http-errors';

class UserPasswordController extends Controller {

  async put(ctx: Context) {

    const userBody: any = ctx.request.body;
    const principalService = new PrincipalService(ctx.privileges);
    const user = await principalService.findByExternalId(ctx.params.id, 'user');

    ctx.privileges.require('a12n:user:change-password', user.href);

    if (!userBody.newPassword || typeof userBody.newPassword !== 'string') {
      throw new UnprocessableEntity('The "newPassword" property is required.');
    }
    if (userBody.newPassword.length < 8) {
      throw new UnprocessableEntity('Passwords must be at least 8 characters.');
    }

    const password = userBody.newPassword;

    await userService.updatePassword(user, password);

    ctx.response.status = 204;

  }

}

export default new UserPasswordController();
