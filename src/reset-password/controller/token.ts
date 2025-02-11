import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';
import { resetPasswordForm } from '../formats/redirect.ts';
import { validateToken } from '../../verification-token/service.ts';

/**
 * This controller is used for validating token and rendering reset password form.
 *
 * After a user gets redirected from the reset password request email,
 * the controller will check if the provided token is validated it will render the
 * reset password form.
 */

class ResetPasswordTokenController extends Controller {

  async get(ctx: Context) {
    const urlToken = ctx.params.token;
    const user = await validateToken(urlToken);
    ctx.session.resetPasswordUser = user;

    if (!ctx.session.resetPasswordUser) {
      throw new Forbidden('You can only use this endpoint after you went through the \'forgot password\' flow');
    }

    ctx.response.type = 'text/html';
    ctx.response.body = resetPasswordForm(ctx.query.msg, ctx.query.error);
  }

}

export default new ResetPasswordTokenController();
