import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal';
import * as userAppPermissionService from '../service';
import { PrincipalService } from '../../principal/privileged-service';

class UserAppPermissionsCollection extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id, 'user');

    const appPermissions = await userAppPermissionService.findByUser(principal);
    ctx.response.body = hal.collection(
      principal,
      appPermissions
    );

  }

}

export default new UserAppPermissionsCollection();
