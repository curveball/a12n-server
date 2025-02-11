import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal.ts';
import { Forbidden } from '@curveball/http-errors';
import * as services from '../../services.ts';
import { PrincipalIdentityPatch } from '../../api-types.ts';

class PrincipalIdentityItem extends Controller {

  async get(ctx: Context) {

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id);

    const identity = await services.principalIdentity.findByExternalId(principal,ctx.params.identityId);

    if (ctx.auth.equals(principal) && !ctx.privileges.has('a12n:user:manage-identities')) {
      throw new Forbidden('You can only use this API for yourself, or if you have the \'a12n:user:manage-identities\'privilege');
    }

    ctx.response.body = hal.item(
      principal,
      identity,
    );

  }

  async patch(ctx: Context) {

    ctx.request.validate<PrincipalIdentityPatch>('https://curveballjs.org/schemas/a12nserver/principal-identity-patch.json');
    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id);

    const identity = await services.principalIdentity.findByExternalId(principal,ctx.params.identityId);

    if (ctx.auth.equals(principal) && !ctx.privileges.has('a12n:user:manage-identities')) {
      throw new Forbidden('You can only use this API for yourself, or if you have the \'a12n:user:manage-identities\'privilege');
    }

    const isMfa = !!(+ctx.request.body.isMfa);
    identity.isMfa = isMfa;
    await services.principalIdentity.update(identity);

    if (ctx.accepts('html')) {
      ctx.redirect(303, identity.href);
    } else {
      ctx.status = 204;
    }

  }

}

export default new PrincipalIdentityItem();
