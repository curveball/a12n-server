import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import { Forbidden } from '@curveball/http-errors';
import { findClientsByUser } from '../service';
import * as userService from '../../user/service';

class ClientCollectionController extends Controller {

  async get(ctx: Context) {

    const user = await userService.findById(ctx.state.params.id);
    if (user.id !== ctx.state.user.id) {
      if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
        throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
      }
    }

    const clients = await findClientsByUser(user);
    ctx.response.body = hal.collection(user, clients);

  }

}

export default new ClientCollectionController();
