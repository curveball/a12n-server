import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';
import { resetPasswordForm } from '../formats/redirect';
import { validateToken } from '../service';

class ResetPasswordTokenController extends Controller {

  async get(ctx: Context) {
    const urlToken = ctx.state.params.token;
    const user = await validateToken(urlToken);
    ctx.state.session.resetPasswordUser = user;

    if (!ctx.state.session.resetPasswordUser) {
      throw new Forbidden('You can only use this endpoint after you went through the \'forgot password\' flow');
    }

    ctx.response.type = 'text/html';
    ctx.response.body = resetPasswordForm(ctx.query.msg);
  }

}

export default new ResetPasswordTokenController();
