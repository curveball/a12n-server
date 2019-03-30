import Controller from '@curveball/controller';
import { Context } from '@curveball/core';

class HealthController extends Controller {

  get(ctx: Context) {

    ctx.response.body = {};

  }

}

export default new HealthController();
