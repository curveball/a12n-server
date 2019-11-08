import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { validateToken } from '../service';

class ResetPasswordTokenController extends Controller {

  async get(ctx: Context) {
    const urlToken = ctx.state.params.token;
    const user = await validateToken(urlToken);
    ctx.state.session.resetPassword = user.id;

    ctx.status = 303;
    ctx.response.headers.set('location', '/reset-password/change-password');
  }

}

export default new ResetPasswordTokenController();
