import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal.ts';
import * as privilegeService from '../service.ts';

class PrivilegeController extends Controller {

  async get(ctx: Context) {
    const privilege = await privilegeService.findPrivilegeType(ctx.params.id);
    ctx.response.body = hal.item(privilege);
  }
}


export default new PrivilegeController();
