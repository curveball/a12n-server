import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as principalService from '../../principal/service';

class UserByHrefController extends Controller {

  async get(ctx: Context) {

    const principal = await principalService.findByHref(decodeURIComponent(ctx.params.href));

    ctx.redirect(303, principal.href);

  }

}

export default new UserByHrefController();
