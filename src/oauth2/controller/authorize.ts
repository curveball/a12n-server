import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';
import querystring from 'querystring';
import log from '../../log/service';
import { EventType } from '../../log/types';
import { getSetting } from '../../server-settings';
import * as userService from '../../user/service';
import { User } from '../../user/types';
import { InvalidClient, InvalidRequest, serializeError, UnsupportedGrantType } from '../errors';
import { loginForm } from '../formats/html';
import * as oauth2Service from '../service';
import { OAuth2Client } from '../types';

class AuthorizeController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';

    let oauth2Client;

    if (!['token', 'code'].includes(ctx.query.response_type)) {
      throw new InvalidRequest('The "response_type" parameter must be provided, and must be "token" or "code"');
    }
    if (!ctx.query.client_id) {
      throw new InvalidRequest('The "client_id" parameter must be provided');
    }
    if (!ctx.query.redirect_uri) {
      throw new InvalidRequest('The "redirect_uri" parameter must be provided');
    }
    const clientId = ctx.query.client_id;
    const state = ctx.query.state;
    // const scope = ctx.query.scope;
    const responseType = ctx.query.response_type;
    const redirectUri = ctx.query.redirect_uri;
    const codeChallenge = ctx.query.code_challenge;
    const codeChallengeMethod = ctx.query.code_challenge_method;
    const grantType = responseType === 'code' ? 'authorization_code' : 'implicit';

    try {
      oauth2Client = await oauth2Service.getClientByClientId(clientId);
    } catch (e) {
      if (e instanceof NotFound) {
        throw new InvalidClient('Client id incorrect');
      } else {
        // Rethrow
        throw e;
      }
    }

    if (!oauth2Client.allowedGrantTypes.includes(grantType)) {
      throw new UnsupportedGrantType('The current client is not allowed to use the ' + grantType + ' grant_type');
    }

    if (!await oauth2Service.validateRedirectUri(oauth2Client, redirectUri)) {
      log(EventType.oauth2BadRedirect, ctx);
      throw new UnsupportedGrantType('This value for "redirect_uri" is not permitted.');
    }

    if (ctx.state.session.user !== undefined) {

      if (responseType === 'token') {
        return this.tokenRedirect(ctx, oauth2Client, redirectUri, state);
      } else {
        return this.codeRedirect(ctx, oauth2Client, redirectUri, state, codeChallenge, codeChallengeMethod);
      }

    } else {
      ctx.response.body = loginForm(
        ctx.query.msg,
        ctx.query.error,
        {
          client_id: clientId,
          state: state,
          redirect_uri: redirectUri,
          response_type: responseType,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
        },
        await getSetting('registration.enabled'),
        await getSetting('totp')
      );
    }

  }

  async post(ctx: Context) {

    let oauth2Client;

    if (!['token', 'code'].includes(ctx.request.body.response_type)) {
      throw new InvalidRequest('The "response_type" parameter must be provided, and must be set to "token" or "code"');
    }
    if (!ctx.request.body.client_id) {
      throw new InvalidRequest('The "client_id" parameter must be provided');
    }
    if (!ctx.request.body.redirect_uri) {
      throw new InvalidRequest('The "redirect_uri" parameter must be provided');
    }
    const clientId = ctx.request.body.client_id;
    const state = ctx.request.body.state;
    const redirectUri = ctx.request.body.redirect_uri;
    const responseType = ctx.request.body.response_type;
    const codeChallenge = ctx.request.body.code_challenge;
    const codeChallengeMethod = ctx.request.body.code_challenge_method;
    const grantType = responseType === 'code' ? 'authorization_code' : 'implicit';

    try {
      oauth2Client = await oauth2Service.getClientByClientId(clientId);
    } catch (e) {
      if (e instanceof NotFound) {
        throw new InvalidClient('Client id incorrect');
      } else {
        // Rethrow
        throw e;
      }
    }

    if (!oauth2Client.allowedGrantTypes.includes(grantType)) {
      throw new UnsupportedGrantType('The current client is not allowed to use the ' + grantType + ' grant_type');
    }

    if (!await oauth2Service.validateRedirectUri(oauth2Client, redirectUri)) {
      log(EventType.oauth2BadRedirect, ctx);
      throw new InvalidRequest('This value for "redirect_uri" is not permitted.');
    }

    const params = {
      redirect_uri: redirectUri,
      client_id: clientId,
      state: state,
      response_type: responseType,
    };

    let user: User;
    try {
      user = await userService.findByIdentity('mailto:' + ctx.request.body.userName);
    } catch (err) {
      return this.redirectToLogin(ctx, { ...params, error: 'Incorrect username or password' });
    }

    if (!await userService.validatePassword(user, ctx.request.body.password)) {
      log(EventType.loginFailed, ctx.ip(), user.id);
      return this.redirectToLogin(ctx, { ...params, error: 'Incorrect username or password'});
    }

    if (!user.active) {
      log(EventType.loginFailedInactive, ctx.ip(), user.id, ctx.request.headers.get('User-Agent'));
      return this.redirectToLogin(ctx, { ...params, error: 'This account is inactive. Please contact Admin'});
    }

    if (ctx.request.body.totp) {
      if (!await userService.validateTotp(user, ctx.request.body.totp)) {
          log(EventType.totpFailed, ctx.ip(), user.id);
          return this.redirectToLogin(ctx, {...params, error: 'Incorrect TOTP code'});
        }
    } else if (await userService.hasTotp(user)) {
      return this.redirectToLogin(ctx, {...params, error: 'TOTP token required'});
    } else if (await getSetting('totp') === 'required') {
      return this.redirectToLogin(ctx, {...params, error: 'The system administrator has made TOTP tokens mandatory, but this user did not have a TOTP configured. Login is disabled'});
    }

    ctx.state.session = {
      user: user,
    };
    log(EventType.loginSuccess, ctx);

    if (responseType === 'token') {
      return this.tokenRedirect(ctx, oauth2Client, params.redirect_uri, params.state);
    } else {
      return this.codeRedirect(ctx, oauth2Client, params.redirect_uri, params.state, codeChallenge, codeChallengeMethod);
    }


 }

  async tokenRedirect(ctx: Context, oauth2Client: OAuth2Client, redirectUri: string, state: string|undefined) {

    const token = await oauth2Service.generateTokenForUser(
      oauth2Client,
      ctx.state.session.user
    );

    ctx.status = 302;
    ctx.response.headers.set('Cache-Control', 'no-cache');
    ctx.response.headers.set(
      'Location',
      redirectUri + '#' + querystring.stringify({
        access_token: token.accessToken,
        token_type: token.tokenType,
        expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
        state: state
      })
    );

  }

  async codeRedirect(
    ctx: Context,
    oauth2Client: OAuth2Client,
    redirectUri: string,
    state: string|undefined,
    codeChallenge: string|undefined,
    codeChallengeMethod: string|undefined,
  ) {

    const code = await oauth2Service.generateCodeForUser(
      oauth2Client,
      ctx.state.session.user,
      codeChallenge,
      codeChallengeMethod,
    );

    ctx.status = 302;
    ctx.response.headers.set('Cache-Control', 'no-cache');
    ctx.response.headers.set(
      'Location',
      redirectUri + '?' + querystring.stringify({
        code: code.code,
        state: state
      })
    );

  }

  /**
   * Redirects to login screen, if login failed
   */
  async redirectToLogin(ctx: Context, params: { [key: string]: string }) {

    ctx.response.status = 302;
    ctx.response.headers.set('Location', '/authorize?' + querystring.stringify(params));

  }

  /**
   * We're overriding the default dipatcher to catch OAuth2 errors.
   */
  async dispatch(ctx: Context): Promise<void> {

    try {
      await super.dispatch(ctx);
    } catch (err) {
      if (err.errorCode) {
        // tslint:disable-next-line:no-console
        console.log(err);
        serializeError(ctx, err);
      } else {
        throw err;
      }
    }

  }

}

export default new AuthorizeController();
