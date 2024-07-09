import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { PrincipalService } from '../../principal/service.js';

class UserByHrefController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const principal = await principalService.findByHref(decodeURIComponent(ctx.params.href));
    ctx.redirect(303, principal.href);

  }

}

export default new UserByHrefController();
