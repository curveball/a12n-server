import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import { Forbidden, NotFound } from '@curveball/http-errors';
import * as principalService from '../../principal/service';
import { findByClientId } from '../service';
import * as oauth2Service from '../../oauth2/service';

class EditClientController extends Controller {

  async get(ctx: Context) {

    const user = await principalService.findByExternalId(ctx.params.id, 'app');
    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can add new OAuth2 clients');
    }

    const client = await findByClientId(ctx.params.clientId);
    if (client.app.id !== user.id) {
      throw new NotFound('OAuth2 client not found');
    }

    ctx.response.body = hal.editForm(client, await oauth2Service.getRedirectUris(client));

  }

}

export default new EditClientController();
