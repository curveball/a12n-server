import { Controller } from '@curveball/controller';
import { Context } from '@curveball/core';
import { Unauthorized } from '@curveball/http-errors';

class MeController extends Controller {

  get(ctx: Context) {

    if (ctx.auth.principal === null) {
      throw new Unauthorized('You need to be logged in to access this endpoint');
    }
    ctx.redirect(ctx.auth.principal.href);

  }

}

export default new MeController();
