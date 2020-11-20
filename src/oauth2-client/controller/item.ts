import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import { Forbidden, NotFound } from '@curveball/http-errors';
import { getClientByClientId } from '../service';
import * as userService from '../../user/service';
import * as oauth2Service from '../../oauth2/service';

class ClientController extends Controller {

  async get(ctx: Context) {

    const user = await userService.findById(ctx.state.params.id);
    if (user.id !== ctx.state.user.id) {
      if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
        throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
      }
    }

    const client = await getClientByClientId(ctx.state.params.clientId);
    if (client.user.id !== user.id) {
      throw new NotFound('OAuth2 client not found');
    }
    ctx.response.body = hal.item(client, await oauth2Service.getRedirectUris(client));

  }

}

export default new ClientController();
