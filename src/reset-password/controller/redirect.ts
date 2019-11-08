import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { resetPasswordForm } from '../formats/redirect';
import { User } from '../../user/types';
import * as UserService from '../../user/service';
import log from '../../log/service';
import { EventType } from '../../log/types';

class ResetPasswordController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = resetPasswordForm(ctx.query.msg);

  }

  async post(ctx: Context) {

    const user: User = ctx.state.session.resetPasswordUser.user;
    const resetNewPassword = ctx.request.body.newPassword;
    const confirmNewPassword = ctx.request.body.confirmNewPassword;

    console.log(user);

    if (resetNewPassword !== confirmNewPassword) {
      ctx.status = 303;
      ctx.response.headers.set('Location', '/reset-password/change-password?msg=New+password+mismatch.+Please+try+again');
      return;
    }

    await UserService.updatePassword(user, resetNewPassword);
    log(EventType.resetPasswordSuccess, ctx);
    ctx.status = 303;
    ctx.response.headers.set('Location', '/login?msg=Your+new+password+has+been+saved');

  }
}

export default new ResetPasswordController();
