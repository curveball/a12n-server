import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import log from '../log/service';
import { EventType } from '../log/types';
import * as UserService from '../user/service';
import { User } from '../principal/types';
import { changePasswordForm } from './formats/html';

class ChangePasswordController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = changePasswordForm(ctx.query.msg, ctx.query.error);

  }

  async post(ctx: Context<any>) {

    const user: User = ctx.session.user;
    const currentPassword = ctx.request.body.currentPassword;
    const userNewPassword = ctx.request.body.newPassword;
    const confirmNewPassword = ctx.request.body.confirmNewPassword;

    if (!await UserService.validatePassword(user, currentPassword)) {
      ctx.status = 303;
      ctx.response.headers.set('Location', '/change-password?error=Current+password+isn\'t+correct.+Please+try+again');
      return;
    }

    if (currentPassword === userNewPassword) {
      ctx.status = 303;
      ctx.response.headers.set('Location', '/change-password?error=New+password+and+old+password+can\'t+be+the+same.+Please+try+again');
      return;
    }

    if (userNewPassword !== confirmNewPassword) {
      ctx.status = 303;
      ctx.response.headers.set('Location', '/change-password?error=New+password+mismatch.+Please+try+again');
      return;
    }

    await UserService.updatePassword(user, userNewPassword);

    ctx.session = {
      user: user,
    };
    log(EventType.changePasswordSuccess, ctx);
    ctx.status = 303;
    ctx.response.headers.set('Location', '/');

  }

}

export default new ChangePasswordController();
