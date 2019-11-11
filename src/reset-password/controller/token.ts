import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { validateToken } from '../service';
import { resetPasswordForm } from '../formats/redirect';

class ResetPasswordTokenController extends Controller {

  async get(ctx: Context) {
    const urlToken = ctx.state.params.token;
    const user = await validateToken(urlToken);
    ctx.state.session.resetPasswordUser = user;
    ctx.response.type = 'text/html';
    ctx.response.body = resetPasswordForm(ctx.query.msg);
  }

}

export default new ResetPasswordTokenController();
