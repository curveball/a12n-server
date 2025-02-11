import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal.ts';
import * as privilegeService from '../service.ts';

class PrivilegeCollectionController extends Controller {

  async get(ctx: Context) {
    const privileges = await privilegeService.findPrivilegeTypes();
    ctx.response.body = hal.collection(privileges);
  }

}


export default new PrivilegeCollectionController();
