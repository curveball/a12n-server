import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal';
import * as privilegeService from '../service';
import { BadRequest } from '@curveball/http-errors';

class PrivilegeSearchController extends Controller {

  async get(ctx: Context) {

    await privilegeService.hasPrivilege(ctx, 'admin');

    if (ctx.query === undefined) {
      throw new BadRequest('The \'resource\' query parameter must be specified');
    }

    const privileges = await privilegeService.findPrivilegesForResource(ctx.query.resource);
    ctx.response.body = hal.search(ctx.query.resource, privileges);
  }
}


export default new PrivilegeSearchController();
