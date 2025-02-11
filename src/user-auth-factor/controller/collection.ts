import { Controller } from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';

import * as services from '../../services.ts';
import { collection } from '../formats/hal.ts';

class UserAuthFactorCollection extends Controller {

  async get(ctx: Context) {

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id, 'user');

    if (ctx.auth.equals(principal) && !ctx.privileges.has('admin')) {
      throw new Forbidden('You can only use this API for yourself, or if you have \'admin\' privileges');
    }

    const userAuthFactors = await services.userAuthFactor.findForUser(principal);

    ctx.response.body = collection(principal, userAuthFactors);

  }


}

export default new UserAuthFactorCollection();
