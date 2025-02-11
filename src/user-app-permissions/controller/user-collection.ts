import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';

import * as hal from '../formats/hal.ts';
import * as userAppPermissionService from '../service.ts';
import { PrincipalService } from '../../principal/service.ts';


class UserAppPermissionsCollection extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id, 'user');

    if (ctx.auth.equals(principal) && !ctx.privileges.has('admin')) {
      throw new Forbidden('You can only use this API for yourself, or if you have \'admin\' privileges');
    }

    const appPermissions = await userAppPermissionService.findByUser(principal);
    ctx.response.body = hal.collection(
      principal,
      appPermissions
    );

  }

}

export default new UserAppPermissionsCollection();
