import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
// import { NotFound } from '@curveball/http-errors';
// import querystring from 'querystring';
import log from '../log/service';
import { EventType } from '../log/types';
import * as UserService from '../user/service';
import { User } from '../user/types';
import { changePasswordForm } from './formats/html';

class ChangePasswordController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = changePasswordForm(ctx.query.msg);

  }

  async post(ctx: Context) {
    
    console.log('--------------')
    let user: User = ctx.state.session.user;
    const currentPassword = ctx.request.body.currentpassword
    const userNewPassword = ctx.request.body.newpassword;
    const confirmNewPassword = ctx.request.body.confirmnewpassword;

    if (!await UserService.validatePassword(user, currentPassword)) {
      ctx.status = 303;
      ctx.response.headers.set('Location', '/changepassword?msg=Current+password+isn\'t+correct.+Please+try+again');
      return;
    }

    if (userNewPassword !== confirmNewPassword) {
      ctx.status = 303;
      ctx.response.headers.set('Location', '/changepassword?msg=New+password+mismatch.+Please+try+again');
      return;
    }

    await UserService.updatePassword(user, userNewPassword);

    ctx.state.session = {
      user: user,
    };
    log(EventType.loginSuccess, ctx);
    ctx.status = 303;
    ctx.response.headers.set('Location', '/');

  }

}

export default new ChangePasswordController();
