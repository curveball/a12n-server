import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import log from '../../log/service';
import { EventType } from '../../log/types';
import { Forbidden } from '@curveball/http-errors';
import * as UserService from '../../user/service';
import { User } from '../../user/types';
import { resetPasswordForm } from '../formats/redirect';

class ResetPasswordController extends Controller {

  async get(ctx: Context) {
    console.log('~~~~get~~~~', ctx.state.session.resetPasswordUser)
    ctx.response.type = 'text/html';
    ctx.response.body = resetPasswordForm(ctx.query.msg);

  }

  async post(ctx: Context) {

    if (!ctx.state.session.resetPasswordUser) {
      throw new Forbidden('You can only use this endpoint after you went to the \'forgot password\' flow');
    }

    const user: User = ctx.state.session.resetPasswordUser;
    const resetNewPassword = ctx.request.body.newPassword;
    const confirmNewPassword = ctx.request.body.confirmNewPassword;

    if (resetNewPassword !== confirmNewPassword) {
      ctx.status = 303;
      ctx.response.headers.set('Location', '/reset-password/change-password?msg=New+password+mismatch.+Please+try+again');
      return;
    }

    await UserService.updatePassword(user, resetNewPassword);

    delete ctx.state.session.resetPasswordUser;
    log(EventType.resetPasswordSuccess, ctx.ip(), user.id);
    ctx.status = 303;
    ctx.response.headers.set('Location', '/login?msg=Your+new+password+has+been+saved');

  }
}

export default new ResetPasswordController();
