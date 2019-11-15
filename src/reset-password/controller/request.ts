import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';
import log from '../../log/service';
import { EventType } from '../../log/types';
import * as userService from '../../user/service';
import { resetPasswordRequestForm } from '../formats/html';
import { sendResetPasswordEmail } from '../service';


/**
 * This controller is used for requesting change password when the user forgot the pasword.
 *
 * In this flow a user first submits the email address and if the email exists in the database,
 * server will send an email.
 */
class ResetPasswordRequestController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = resetPasswordRequestForm(ctx.query.msg);

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

    if (!user.active) {
      ctx.status = 303;
      ctx.response.headers.set('location', '/reset-password?msg=User+account+is+inactive,+please+contact+admin');
      return;
    }
    await sendResetPasswordEmail(user);
    await log(EventType.resetPasswordRequest, ctx.ip(), user.id);

    ctx.status = 303;
    ctx.response.headers.set('location', '/reset-password?msg=We\'ve+sent+you+a+link+to+your+email+for+changing+password');
  }
}

export default new ResetPasswordRequestController();
