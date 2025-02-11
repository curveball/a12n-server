import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound, BadRequest } from '@curveball/http-errors';
import { resetPasswordRequestForm } from '../formats/html.ts';
import * as services from '../../services.ts';
import { getLoggerFromContext } from '../../log/service.ts';

/**
 * This controller is used for requesting change password when the user forgot the password.
 *
 * In this flow a user first submits the email address and if the email exists in the database,
 * server will send an email.
 */
class ResetPasswordRequestController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';
    ctx.response.body = resetPasswordRequestForm(ctx.query.msg, ctx.query.error);

  }

  async post(ctx: Context<any>) {

    // Insecure means there are no privilege restrictions in doing this.
    // Normally findByIdentity is protected but for this specific case it's public.
    const principalService = new services.principal.PrincipalService('insecure');
    const identityUri = 'mailto:' + ctx.request.body.emailAddress;
    let user, identity;
    try {
      identity = await services.principalIdentity.findByUri(identityUri);
      user = await principalService.findByIdentity(identity);
    } catch (err) {
      if (err instanceof NotFound) {
        ctx.redirect(303, '/reset-password?error=Account+not+found.+Please+try+again');
        return;
      } else {
        throw err;
      }
    }

    if (!user.active) {
      ctx.redirect(303, '/reset-password?error=User+account+is+inactive,+please+contact+administrator.');
      return;
    }
    if (user.type !== 'user') {
      throw new BadRequest('This endpoint can only be called for principals of type \'user\'.');
    }
    await services.resetPassword.sendResetPasswordEmail(user, identity);
    const log = getLoggerFromContext(ctx, user);
    await log('reset-password-request');

    ctx.redirect(303, '/reset-password?msg=Password+reset+request+submitted.+Please+check+your+email+for+further+instructions.');
  }
}

export default new ResetPasswordRequestController();
