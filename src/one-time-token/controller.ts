import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../privilege/service';
import { Forbidden, NotFound } from '@curveball/http-errors';
import * as userService from '../user/service';
import { User } from '../user/types';
import { createToken } from '../reset-password/service';
import * as hal from './formats/hal';

class OneTimeTokenController extends Controller {

  async post(ctx: Context<any>) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can request for one time token');
    }

    let user: User;
    try {
      user = await userService.findByIdentity(ctx.state.user.identity);
    } catch (err) {
      if (err instanceof NotFound) {
        ctx.status = 404;
        return;
      } else {
        throw err;
      }
    }

    const token = await createToken(user);
    const url = new URL(process.env.PUBLIC_URI + 'reset-password/token/' + token);

    ctx.response.body = hal.oneTimeToken(url);

  }

}

export default new OneTimeTokenController();
