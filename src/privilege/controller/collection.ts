import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal';
import * as privilegeService from '../service';

class PrivilegeCollectionController extends Controller {

  async get(ctx: Context) {
    const privileges = await privilegeService.findPrivileges();
    ctx.response.body = hal.collection(privileges);
  }

}


export default new PrivilegeCollectionController();
