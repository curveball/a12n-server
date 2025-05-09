import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest, Forbidden } from '@curveball/http-errors';
import { hasUsers } from '../../principal/service.ts';
import { getSetting } from '../../server-settings.ts';
import * as loginService from '../service.ts';
import * as services from '../../services.ts';
import { AuthorizationChallengeRequest } from '../../api-types.ts';
import { A12nLoginChallengeError, ChallengeErrorCode } from '../error.ts';
import { render } from '../../templates.ts';
import { LoginSession } from '../types.ts';

const challenges = ['username', 'password'] as const;
type Challenge = typeof challenges[number]; 

const ErrorMap: Partial<Record<ChallengeErrorCode, string>> = {
  'username_or_password_invalid': 'The username or password you entered was incorrect. Try again',
};

/**
 * The Experimental Login form uses the new login subsystem.
 *
 * It exists for testing purposes, but will eventually replace the normal login flow
 * once it has the same level of functionality.
 */
class LoginExperimentalController extends Controller {

  async get(ctx: Context) {

    const continueUrl = ctx.query.continue || undefined;
    const continueParam = continueUrl ? '?' + new URLSearchParams({continue: continueUrl}) : '';
    const registrationUri = '/register' + continueParam;
    const resetPasswordUri = '/reset-password' + continueParam;

    const firstRun = !(await hasUsers());
    if (firstRun) {
      ctx.redirect(302, registrationUri);
      return;
    }
    
    const session = await initSession(ctx);

    let error = ctx.query.error ?
      (ErrorMap[ctx.query.error as ChallengeErrorCode] ?? ctx.query.error) :
      undefined;

    let challenge: Challenge = 'username';
    if (ctx.query.challenge) {
      if (challenges.includes(ctx.query.challenge as any)) {
        challenge = ctx.query.challenge as Challenge;
      } else {
        throw new BadRequest('Invalid challenge');
      }
    }

    ctx.response.type = 'text/html';
    ctx.response.body = render('login-experimental/' + challenge, {
      title: 'Login',
      msg: ctx.query.msg,
      error: error,
      username: session.username,
      hiddenFields: {
        continue: ctx.query.continueUrl,
      },
      registrationEnabled: getSetting('registration.enabled'),
      registrationUri: registrationUri,
      resetPasswordUri: resetPasswordUri,
    }, 'minimal-form');

  }

  async post(ctx: Context<any>) {

    if (!ctx.accepts('html')) {
      throw new Forbidden('Hey there! It looks like you tried to directly submit to the /login endpoint. This is not allowed. If you want to authenticate your app with a12n-server, you should use an OAuth2 flow instead. This form and endpoint is only meant for humans.');
    }
    const parameters: AuthorizationChallengeRequest = {
      username: ctx.request.body.userName,
    };
    if (ctx.request.body.password?.length > 0) {
      parameters.password = ctx.request.body.password;
    }
    const client = await services.appClient.findSystemClient();
    console.log(ctx.request.body);

    const session = await initSession(ctx);
    console.log('Session:', session);

    let result;
    try {
       result = await loginService.challenge(client, session, parameters);
    } catch (e) {
      if (e instanceof A12nLoginChallengeError) {
        let challenge: Challenge;
        let error = undefined;
        switch(e.errorCode) {
          case 'password_required':
            challenge = 'password';
            break;
          default :
            challenge = 'username';
            error = e.errorCode;
            break; 
        }
        ctx.session.loginAuthSession = session.authSession;
        
        redirectToLogin(ctx, {
          continue: ctx.request.body.continue || undefined,
          challenge,
          error,
        });
        return;
      } else {
        throw e;
      }
    }
    ctx.response.body = {
      authorization_code: result.code,
    };

    throw new Error('Not implemented');

  }

}

type RedirectParams = {
  continue?: string;
  challenge: Challenge,
  error?: ChallengeErrorCode
};

/**
 * Helper function for a redirect back to the login challenge page.
 */
function redirectToLogin(ctx: Context, redirectParams: RedirectParams) {

  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(redirectParams).filter(([key, value]) => value !== undefined)
    )
  );

  ctx.redirect(303, '/login/experimental' + '?' + params);

}

/**
 * Returns a login session, or creates a new one.
 */
async function initSession(ctx: Context): Promise<LoginSession> {

  if (ctx.session.loginAuthSession) {
    return loginService.getSession(
      await services.appClient.findSystemClient(),
      {
        auth_session: ctx.session.loginAuthSession,
      }
    );
  } else {
    const session = await loginService.getSession(
      await services.appClient.findSystemClient(),
      {
      }
    );
    ctx.session.loginAuthSession = session.authSession;
    return session;
  }
}


export default new LoginExperimentalController();
