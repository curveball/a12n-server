import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as siren from '../formats/siren';
import { Forbidden } from '@curveball/http-errors';
import { PrincipalService } from '../../principal/privileged-service';

class NewClientController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const user = await principalService.findByExternalId(ctx.params.id, 'app');
    if (!ctx.privileges.has('admin')) {
      throw new Forbidden('Only users with the "admin" privilege can add new OAuth2 clients');
    }

    ctx.response.type = 'application/vnd.siren+json';
    ctx.response.body = siren.newClient(user, ctx.query);

  }

}

export default new NewClientController();
