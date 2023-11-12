import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';
import log from '../../log/service';
import { EventType } from '../../log/types';
import * as UserService from '../../user/service';
import { User } from '../../types';
import { resetPasswordForm } from '../formats/redirect';

class ResetPasswordController extends Controller {

  /**
   * If passwords provided didn't match for new and confirm passwords, it will
   * render this reset password form.
   */
  async get(ctx: Context) {

    if (!ctx.session.resetPasswordUser) {
      throw new Forbidden('You can only use this endpoint after you went through the \'forgot password\' flow');
    }
    ctx.response.type = 'text/html';
    ctx.response.body = resetPasswordForm(ctx.query.msg, ctx.query.error);

  }

  /**
   * This request checks if provided 2 passwords, new password and confirm password, is identical
   * and updates database with the new password.
   */
  async post(ctx: Context<any>) {

    if (!ctx.session.resetPasswordUser) {
      throw new Forbidden('You can only use this endpoint after you went through the \'forgot password\' flow');
    }

    const user: User = ctx.session.resetPasswordUser;
    const resetNewPassword = ctx.request.body.newPassword;
    const confirmNewPassword = ctx.request.body.confirmNewPassword;

    if (resetNewPassword !== confirmNewPassword) {
      ctx.status = 303;
      ctx.response.headers.set('Location', '/reset-password/change-password?error=New+password+mismatch.+Please+try+again');
      return;
    }

    await UserService.updatePassword(user, resetNewPassword, false);

    delete ctx.session.resetPasswordUser;
    log(EventType.resetPasswordSuccess, ctx.ip()!, user.id);
    ctx.status = 303;
    ctx.response.headers.set('Location', '/login?msg=Your+new+password+has+been+saved');

  }
}

export default new ResetPasswordController();
