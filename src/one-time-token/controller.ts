import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../privilege/service';
import { Forbidden, NotFound } from '@curveball/http-errors';
import * as userService from '../user/service';
import { User } from '../user/types';
import { createToken } from '../reset-password/service';

class OneTimeTokenController extends Controller {

  async post(ctx: Context<any>) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can create new users');
    }

    let user: User;
    try {
      user = await userService.findByIdentity(ctx.state.user.identity);
    } catch (err) {
      if (err instanceof NotFound) {
        ctx.redirect(303, '/reset-password?error=Account+not+found.+Please+try+again');
        return;
      } else {
        throw err;
      }
    }

    const token = await createToken(user);
    const url = process.env.PUBLIC_URI + 'reset-password/token/' + token

    const oneTimeToken = { token, url }
    return oneTimeToken

  }

}

export default new OneTimeTokenController();
