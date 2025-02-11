import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal.ts';
import { Forbidden, NotFound } from '@curveball/http-errors';
import { findByClientId } from '../service.ts';
import { PrincipalService } from '../../principal/service.ts';
import * as oauth2Service from '../../oauth2/service.ts';

class ClientController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const user = await principalService.findByExternalId(ctx.params.id, 'app');
    if (ctx.auth.equals(user)) {
      if (!ctx.privileges.has('admin')) {
        throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
      }
    }

    const client = await findByClientId(ctx.params.clientId);
    if (client.app.id !== user.id) {
      throw new NotFound('OAuth2 client not found');
    }
    ctx.response.body = hal.item(client, await oauth2Service.getRedirectUris(client));

  }

}

export default new ClientController();
