import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal.js';
import { Forbidden } from '@curveball/http-errors';
import * as services from '../../services.js';

class PrincipalIdentityVerify extends Controller {

  async post(ctx: Context) {

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id);

    const identity = await services.principalIdentity.findByExternalId(principal,ctx.params.identityId);

    if (ctx.auth.equals(principal) && !ctx.privileges.has('admin')) {
      throw new Forbidden('You can only use this API for yourself, or if you have \'admin\' privileges');
    }

    await services.principalIdentity.sendVerificationRequest(identity);
    ctx.response.body = hal.verifyResponseForm(identity);

  }

}

export default new PrincipalIdentityVerify();
