import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../service';
import * as hal from '../formats/hal'

class PrivilegeController extends Controller {

  async get(ctx: Context) {
    const privilege = await privilegeService.findPrivilege(ctx.state.params.id);
    ctx.response.body = hal.item(privilege);
  }
}


export default new PrivilegeController();
