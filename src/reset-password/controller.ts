import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';
import * as userService from '../user/service';
import { resetPasswordForm } from './formats/html';
import { sendResetPasswordEmail } from './service';
import log from '../log/service';
import { EventType } from '../log/types';

class ResetPasswordController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = resetPasswordForm(ctx.query.msg);

  }

  async post(ctx: Context) {

    let user;
    try {
        user = await userService.findByIdentity('mailto:' + ctx.request.body.emailAddress);
    } catch (err) {
        if (err instanceof NotFound) {
            ctx.status = 303;
            ctx.response.headers.set('location', '/reset-password?msg=We+can\'t+seem+to+find+your+record.+Please+try+gain');
            return;
        } else {
            throw err;
        }
    }

    await sendResetPasswordEmail(user);
    await log(EventType.resetPasswordRequest, ctx.ip(), user.id);

    ctx.status = 303;
    ctx.response.headers.set('location', '/reset-password?msg=We\'ve+sent+you+a+link+to+your+email+for+changing+password');
  }
}

export default new ResetPasswordController();

// log(EventType.resetPasswordSuccess, ctx);