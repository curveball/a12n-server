import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound, BadRequest, MethodNotAllowed, UnsupportedMediaType } from '@curveball/http-errors';
import { resetPasswordRequestForm } from '../formats/html.ts';
import * as services from '../../services.ts';
import { getLoggerFromContext } from '../../log/service.ts';
import { getSetting } from '../../server-settings.ts';
import { ResetPasswordRequest } from '../../api-types.ts';

/**
 * This controller is used for requesting change password when the user forgot the password.
 *
 * In this flow a user first submits the email address and if the email exists in the database,
 * server will send an email.
 */
class ResetPasswordRequestController extends Controller {

  async get(ctx: Context) {

    if (!userFacingResetPasswordEnabled()) {
      throw new MethodNotAllowed('Reset password requests are not enabled on this server.');
    }
    ctx.response.type = 'text/html';
    ctx.response.body = resetPasswordRequestForm(ctx.query.msg, ctx.query.error);

  }

  /**
   * This endpoint can either be called by the user directly, or by an API client.
   *
   * The mode will be determined by the Content-Type header.
   */
  async post(ctx: Context) {

    if (ctx.request.is('application/x-www-form-urlencoded')) {
      return this.postForm(ctx);
    }
    if (ctx.request.is('json')) {
      return this.postJson(ctx);
    }
    throw new UnsupportedMediaType('This endpoint only accepts x-www-form-urlencoded or json content types.');

  }

  async postForm(ctx: Context) {
    if (!userFacingResetPasswordEnabled()) {
      throw new MethodNotAllowed('Reset password requests are not enabled on this server.');
    }
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

  async postJson(ctx: Context) {

    ctx.privileges.require('a12n:reset-password:request');
    ctx.request.validate<ResetPasswordRequest>('https://curveballjs.org/schemas/a12nserver/reset-password-request.json');

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const identity = await services.principalIdentity.findByUri(ctx.request.body.href);
    const user = await principalService.findByIdentity(identity);
    if (user.type !== 'user') {
      throw new BadRequest('This endpoint can only be called for principals of type \'user\'.');
    }

    if (ctx.request.body.mode === 'return') {
      ctx.response.body = await services.resetPassword.getResetPasswordTokens(
        user,
        identity,
        ctx.request.body.urlTemplate
      );
      throw new Error('not yet implemented');
    } else {
      await services.resetPassword.sendResetPasswordEmail(
        user,
        identity,
        ctx.request.body.urlTemplate
      );
      ctx.response.status = 202;
      ctx.response.body = {
        message: 'Password reset request submitted. Please check your email for further instructions.',
      };
    }

  }

}

function userFacingResetPasswordEnabled() {
  return getSetting('reset-password.enabled');
}


export default new ResetPasswordRequestController();
