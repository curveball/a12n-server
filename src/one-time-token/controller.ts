import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../privilege/service';
import { Forbidden } from '@curveball/http-errors';
import * as userService from '../user/service';
import { createToken } from '../reset-password/service';
import * as hal from './formats/hal';
import { resolve } from 'url';

class OneTimeTokenController extends Controller {

  async post(ctx: Context<any>) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can request for one time token');
    }

    const user = await userService.findByIdentity(ctx.state.user.identity);

    if (user.type !== 'user') {
      throw new Forbidden('One-time token may only be obtained for users');
    }


    const token = await createToken(user);
    const url = resolve(process.env.PUBLIC_URI!, 'reset-password/token/' + token);

    ctx.response.body = hal.oneTimeToken(user, url, token);

  }

}

export default new OneTimeTokenController();
