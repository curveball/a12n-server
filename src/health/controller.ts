import { Context } from '@curveball/core';
import Controller from '@curveball/controller';

class HealthController extends Controller {

  get(ctx: Context) {

    ctx.response.body = {};

  }

}

export default new HealthController();
