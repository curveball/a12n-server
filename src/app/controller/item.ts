import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service.js';
import * as hal from '../formats/hal.js';
import { PrincipalService } from '../../principal/service.js';

type EditPrincipalBody = {
  nickname: string;
  active: boolean;
  type: 'user' | 'app' | 'group';

  /**
   * We don't care about the below types yet.
   *
   * In the future we will auto-generate _good_ types from the schemas
   * and then all of this will be cleaned up
   */
  createdAt?: unknown;
  modifiedAt?: unknown;
  privileges?: unknown;
}

class AppController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const app = await principalService.findByExternalId(ctx.params.id, 'app');

    const isAdmin = ctx.privileges.has('admin');

    const principalPrivileges = await privilegeService.get(app);
    ctx.response.body = hal.item(
      app,
      principalPrivileges.getAll(),
      isAdmin,
      await principalService.findGroupsForPrincipal(app),
    );

  }

  async put(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);

    ctx.request.validate<EditPrincipalBody>(
      'https://curveballjs.org/schemas/a12nserver/principal-edit.json'
    );

    const user = await principalService.findByExternalId(ctx.params.id, 'app');
    user.active = !!ctx.request.body.active;
    user.nickname = ctx.request.body.nickname;

    await principalService.save(user);
    ctx.status = 204;

  }

}

export default new AppController();
