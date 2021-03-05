import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import hal from './formats/hal';
import * as privilegeService from '../privilege/service';

class HomeController extends Controller {

  async get(ctx: Context) {

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const version = require('../../package.json').version;
    const user = ctx.state.user;
    const isAdmin = await privilegeService.hasPrivilege(user, 'admin', '*');
    ctx.response.body = hal(version, user, isAdmin);

  }

}

export default new HomeController();
