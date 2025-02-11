import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal.ts';
import * as privilegeService from '../service.ts';
import { BadRequest } from '@curveball/http-errors';

class PrivilegeSearchController extends Controller {

  async get(ctx: Context) {

    ctx.privileges.require('admin');

    if (ctx.query === undefined) {
      throw new BadRequest('The \'resource\' query parameter must be specified');
    }

    const privileges = await privilegeService.findPrivilegesForResource(ctx.query.resource);
    ctx.response.body = hal.search(ctx.query.resource, privileges);
  }
}


export default new PrivilegeSearchController();
