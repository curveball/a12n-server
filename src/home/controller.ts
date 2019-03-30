import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import hal from './formats/hal';

class HomeController extends Controller {

  get(ctx: Context) {

    const version = require('../../package.json').version;
    ctx.response.body = hal(version);

  }

}

export default new HomeController();
