import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';
import querystring from 'querystring';
import { InvalidClient, InvalidRequest, UnsupportedGrantType } from '../errors';
import * as oauth2Service from '../service';
import { CodeChallengeMethod } from '../types';
import { OAuth2Client } from '../../oauth2-client/types';
import log from '../../log/service';
import { EventType } from '../../log/types';
import { getClientByClientId } from '../../oauth2-client/service';

class AuthorizeController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';

    let oauth2Client;
    let codeChallengeMethod: CodeChallengeMethod|undefined = undefined;

    if (!['token', 'code'].includes(ctx.query.response_type)) {
      throw new InvalidRequest('The "response_type" parameter must be provided, and must be "token" or "code"');
    }
    if (!ctx.query.client_id) {
      throw new InvalidRequest('The "client_id" parameter must be provided');
    }
    if (!ctx.query.redirect_uri) {
      throw new InvalidRequest('The "redirect_uri" parameter must be provided');
    }
    if (ctx.query.response_type === 'code') {
      if (!ctx.query.code_challenge && ctx.query.code_challenge_method) {
        throw new InvalidRequest('The "code_challenge" must be provided');
      }
      if (ctx.query.code_challenge_method) {
        switch(ctx.query.code_challenge_method) {
          case 'S256':
          case 'plain':
            codeChallengeMethod = ctx.query.code_challenge_method;
            break;
          default:
            throw new InvalidRequest('The "code_challenge_method" must be "plain" or "S256"');
        }
      } else {
        codeChallengeMethod = ctx.query.code_challenge ? 'plain' : undefined;
      }
    }
    const clientId = ctx.query.client_id;
    const state = ctx.query.state;
    // const scope = ctx.query.scope;
    const responseType = ctx.query.response_type;
    const redirectUri = ctx.query.redirect_uri;
    const codeChallenge = ctx.query.code_challenge;
    const grantType = responseType === 'code' ? 'authorization_code' : 'implicit';

    try {
      oauth2Client = await getClientByClientId(clientId);
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

    try {
      await oauth2Service.requireRedirectUri(oauth2Client, redirectUri);
    } catch (err) {
      log(EventType.oauth2BadRedirect, ctx);
      throw err;
    }

    if (ctx.session.user !== undefined) {

      if (responseType === 'token') {
        return this.tokenRedirect(ctx, oauth2Client, redirectUri, state);
      } else {
        return this.codeRedirect(ctx, oauth2Client, redirectUri, state, codeChallenge, codeChallengeMethod);
      }

    } else {
      return this.redirectToLogin(ctx, {'continue': ctx.request.requestTarget});
    }

  }

  async tokenRedirect(ctx: Context, oauth2Client: OAuth2Client, redirectUri: string, state: string|undefined) {

    const token = await oauth2Service.generateTokenForUser(
      oauth2Client,
      ctx.session.user
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
    codeChallengeMethod: 'S256' | 'plain' | undefined
  ) {

    const code = await oauth2Service.generateCodeForUser(
      oauth2Client,
      ctx.session.user,
      codeChallenge,
      codeChallengeMethod,
      ctx.sessionId!,
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
    ctx.response.headers.set('Location', '/login?' + querystring.stringify(params));

  }

}

export default new AuthorizeController();
