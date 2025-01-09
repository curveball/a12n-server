import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';
import * as hal from '../formats/hal.js';
import * as services from '../../services.js';

class PrincipalIdentityCollection extends Controller {

  async get(ctx: Context) {

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id, 'user');
    const identities = await services.principalIdentity.findByPrincipal(principal);

    if (ctx.auth.equals(principal) && !ctx.privileges.has('a12n:user:manage-identities')) {
      throw new Forbidden('You can only use this API for yourself, or if you have the \'a12n:user:manage-identities\'privilege');
    }

    ctx.response.body = hal.collection(
      principal,
      identities,
    );

  }

}

export default new PrincipalIdentityCollection();
