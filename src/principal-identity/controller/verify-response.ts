import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal.js';
import { Forbidden, isHttpError } from '@curveball/http-errors';
import * as services from '../../services.js';
import { PrincipalIdentityVerifyForm } from '../../api-types.js';

class PrincipalIdentityVerify extends Controller {

  async get(ctx: Context) {

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id);

    const identity = await services.principalIdentity.findByExternalId(principal,ctx.params.identityId);

    if (ctx.auth.equals(principal) && !ctx.privileges.has('a12n:user:manage-identities')) {
      throw new Forbidden('You can only use this API for yourself, or if you have the \'a12n:user:manage-identities\'privilege');
    }
    ctx.response.body = hal.verifyResponseForm(identity);

  }

  async post(ctx: Context) {

    ctx.request.validate<PrincipalIdentityVerifyForm>('https://curveballjs.org/schemas/a12nserver/principal-identity-verify-form.json');
    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id);

    const identity = await services.principalIdentity.findByExternalId(principal,ctx.params.identityId);

    if (ctx.auth.equals(principal) && !ctx.privileges.has('a12n:user:manage-identities')) {
      throw new Forbidden('You can only use this API for yourself, or if you have the \'a12n:user:manage-identities\'privilege');
    }

    try {
      await services.principalIdentity.verifyIdentity(identity, ctx.request.body.code);
      if (ctx.request.body.enableMfa && !identity.isMfa) {
        identity.isMfa = true;
        await services.principalIdentity.update(identity);
      }
      ctx.response.body = hal.verifySuccess(identity);
    } catch (err) {
      if (isHttpError(err)) {
        ctx.status = err.httpStatus;
        ctx.response.body = hal.verifyFail(identity, err);
      } else {
        throw err;
      }
    }


  }

}

export default new PrincipalIdentityVerify();
