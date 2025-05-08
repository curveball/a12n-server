import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';
import { hasUsers } from '../../principal/service.ts';
import { getSetting } from '../../server-settings.ts';
import { loginExperimentalForm } from '../formats/html.ts';

/**
 * The Experimental Login form uses the new login subsystem.
 *
 * It exists for testing purposes, but will eventually replace the normal login flow
 * once it has the same level of functionality.
 */
class LoginExperimentalController extends Controller {

  async get(ctx: Context) {

    const continueParam = ctx.query.continue ? '?' + new URLSearchParams({continue: ctx.query.continue}) : '';
    const registrationUri = '/register' + continueParam;
    const resetPasswordUri = '/reset-password' + continueParam;

    const firstRun = !(await hasUsers());
    if (firstRun) {
      ctx.redirect(302, registrationUri);
      return;
    }

    ctx.response.type = 'text/html';
    ctx.response.body = loginExperimentalForm({
      title: 'Login',
      msg: ctx.query.msg,
      error: ctx.query.error,
      hiddenFields: {
        continue: ctx.query.continue,
      },
      registrationEnabled: getSetting('registration.enabled'),
      registrationUri: registrationUri,
      resetPasswordUri: resetPasswordUri,
    });

  }

  async post(ctx: Context<any>) {

    if (!ctx.accepts('html')) {
      throw new Forbidden('Hey there! It looks like you tried to directly submit to the /login endpoint. This is not allowed. If you want to authenticate your app with a12n-server, you should use an OAuth2 flow instead. This form and endpoint is only meant for humans.');
    }

    throw new Error('Not implemented');

  }

}

export default new LoginExperimentalController();
