import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import hal from './formats/hal';

class HomeController extends Controller {

  get(ctx: Context) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const version = require('../../package.json').version;
    ctx.response.body = hal(version, ctx.state.user);

  }

}

export default new HomeController();
