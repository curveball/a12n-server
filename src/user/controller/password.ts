import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { PrincipalService } from '../../principal/service.ts';
import * as userService from '../service.ts';
import { UnprocessableContent } from '@curveball/http-errors';

class UserPasswordController extends Controller {

  async put(ctx: Context) {

    const userBody: any = ctx.request.body;
    const principalService = new PrincipalService(ctx.privileges);
    const user = await principalService.findByExternalId(ctx.params.id, 'user');

    ctx.privileges.require('a12n:user:change-password', user.href);

    if (!userBody.newPassword || typeof userBody.newPassword !== 'string') {
      throw new UnprocessableContent('The "newPassword" property is required.');
    }

    const password = userBody.newPassword;

    await userService.updatePassword(user, password);

    ctx.response.status = 204;

  }

}

export default new UserPasswordController();
