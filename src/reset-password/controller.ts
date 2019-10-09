import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { resetPasswordForm } from './formats/html';

class ResetPasswordController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = resetPasswordForm(ctx.query.msg);

  }

}

export default new ResetPasswordController();
