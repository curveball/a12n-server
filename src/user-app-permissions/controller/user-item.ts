import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import { Forbidden } from '@curveball/http-errors';
import * as principalService from '../../principal/service';
import * as userAppPermissionService from '../service';

class UserAppPermissionsItem extends Controller {

  async get(ctx: Context) {

    const user = await principalService.findByExternalId(ctx.params.id, 'user');
    if (ctx.auth.equals(user) && !await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('You can only use this API for yourself yourself, or if you have \'admin\' privileges');
    }
    const app = await principalService.findByExternalId(ctx.params.appId, 'app');

    const appPermission = await userAppPermissionService.findByUserAndApp(
      user,
      app
    );
    ctx.response.body = hal.item(
      appPermission
    );

  }

}

export default new UserAppPermissionsItem();
