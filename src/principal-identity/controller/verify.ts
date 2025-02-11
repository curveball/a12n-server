import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';
import * as services from '../../services.ts';

class PrincipalIdentityVerify extends Controller {

  async post(ctx: Context) {

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id);

    const identity = await services.principalIdentity.findByExternalId(principal,ctx.params.identityId);

    if (ctx.auth.equals(principal) && !ctx.privileges.has('a12n:user:manage-identities')) {
      throw new Forbidden('You can only use this API for yourself, or if you have the \'a12n:user:manage-identities\'privilege');
    }

    await services.principalIdentity.sendVerificationRequest(identity, ctx.ip()!);
    ctx.redirect(303, `${identity.href}/verify-response`);

  }

}

export default new PrincipalIdentityVerify();
