import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import { Forbidden } from '@curveball/http-errors';
import * as principalService from '../../principal/service';
import * as userAppPermissionService from '../service';

class UserAppPermissionsCollection extends Controller {

  async get(ctx: Context) {

    const principal = await principalService.findByExternalId(ctx.params.id, 'user');
    if (ctx.auth.equals(principal) && !await privilegeService.hasPrivilege(ctx, 'admin')) {
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
