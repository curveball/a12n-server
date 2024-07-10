import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal.js';
import * as privilegeService from '../service.js';

class PrivilegeController extends Controller {

  async get(ctx: Context) {
    const privilege = await privilegeService.findPrivilegeType(ctx.params.id);
    ctx.response.body = hal.item(privilege);
  }
}


export default new PrivilegeController();
