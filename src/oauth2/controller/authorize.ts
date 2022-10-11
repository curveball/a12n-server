import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';
import * as querystring from 'querystring';
import { InvalidClient, InvalidRequest, UnsupportedGrantType } from '../errors';
import * as oauth2Service from '../service';
import { CodeChallengeMethod } from '../types';
import { OAuth2Client } from '../../oauth2-client/types';
import log from '../../log/service';
import { EventType } from '../../log/types';
import { findByClientId } from '../../oauth2-client/service';
import * as userAppPermissions from '../../user-app-permissions/service';

class AuthorizeController extends Controller {

  async get(ctx: Context) {

    ctx.response.type = 'text/html';

    const params = parseAuthorizationQuery(ctx.query);
    let oauth2Client;

    try {
      oauth2Client = await findByClientId(params.clientId);
    } catch (e) {
      if (e instanceof NotFound) {
        throw new InvalidClient('Client id incorrect');
      } else {
        // Rethrow
        throw e;
      }
    }

    if (!params.redirectUri) {
      throw new InvalidRequest('The "redirect_uri" parameter must be provided');
    }

    if (params.responseType === 'code') {

      if (oauth2Client.requirePkce && !params.codeChallenge) {
        throw new InvalidRequest('This endpoint requires that OAuth2 client support PKCE, and your client did not pass the correct parameters. Either turn off the PKCE requirement for this OAuth2 client, or upgrade to an OAuth2 client library that supports PKCE.');
      }
    }

    const grantType = params.responseType === 'code' ? 'authorization_code' : 'implicit';

    if (!oauth2Client.allowedGrantTypes.includes(grantType)) {
      throw new UnsupportedGrantType('The current client is not allowed to use the ' + grantType + ' grant_type');
    }

    try {
      await oauth2Service.requireRedirectUri(oauth2Client, params.redirectUri);
    } catch (err) {
      log(EventType.oauth2BadRedirect, ctx);
      throw err;
    }

    if (ctx.session.user !== undefined) {

      await userAppPermissions.setPermissions(
        oauth2Client.app,
        ctx.session.user,
        params.scope,
      );
      if (params.responseType === 'token') {
        return this.tokenRedirect(ctx, oauth2Client, params);
      } else {
        return this.codeRedirect(ctx, oauth2Client, params);
      }

    } else {
      return this.redirectToLogin(ctx, {'continue': ctx.request.requestTarget});
    }

  }

  async tokenRedirect(ctx: Context, oauth2Client: OAuth2Client, params: AuthorizeParamsToken) {

    const token = await oauth2Service.generateTokenImplicit({
      client: oauth2Client,
      scope: params.scope,
      principal: ctx.session.user,
      browserSessionId: ctx.sessionId!,
    });

    ctx.status = 302;
    ctx.response.headers.set('Cache-Control', 'no-cache');
    ctx.response.headers.set(
      'Location',
      params.redirectUri + '#' + querystring.stringify({
        access_token: token.accessToken,
        token_type: token.tokenType,
        expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
        state: params.state
      })
    );

  }

  async codeRedirect(
    ctx: Context,
    oauth2Client: OAuth2Client,
    params: AuthorizeParamsCode
  ) {

    const code = await oauth2Service.generateAuthorizationCode({
      client: oauth2Client,
      principal: ctx.session.user,
      scope: params.scope,
      codeChallenge: params.codeChallenge,
      codeChallengeMethod: params.codeChallengeMethod,
      browserSessionId: ctx.sessionId!,
    });

    ctx.status = 302;
    ctx.response.headers.set('Cache-Control', 'no-cache');
    ctx.response.headers.set(
      'Location',
      params.redirectUri + '?' + querystring.stringify({
        code: code.code,
        state: params.state
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

type AuthorizeParamsCode = {
  responseType: 'code';
  clientId: string;
  redirectUri?: string;
  scope: string[];
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: CodeChallengeMethod;
};

type AuthorizeParamsToken = {
  responseType: 'token';
  clientId: string;
  redirectUri?: string;
  scope: string[];
  state?: string;
}

type AuthorizeParams = AuthorizeParamsCode | AuthorizeParamsToken;

function parseAuthorizationQuery(query: Record<string, string>): AuthorizeParams {

  if (!['token', 'code'].includes(query.response_type)) {
    throw new InvalidRequest('The "response_type" parameter must be provided, and must be "token" or "code"');
  }
  const responseType: 'code' | 'token' = query.response_type as any;
  if (!query.client_id) {
    throw new InvalidRequest('The "client_id" parameter must be provided');
  }
  const clientId = query.client_id;

  if (responseType === 'token') {
    return {
      responseType,
      clientId,
      redirectUri: query.redirect_uri ?? undefined,
      state: query.state ?? undefined,
      scope: query.scope ? query.scope.split(' ') : []
    };
  }

  if (!query.code_challenge && query.code_challenge_method) {
    throw new InvalidRequest('The "code_challenge" must be provided');
  }
  let codeChallengeMethod: CodeChallengeMethod|undefined = undefined;
  const codeChallenge: string|undefined = query.code_challenge;
  if (query.code_challenge_method) {
    switch(query.code_challenge_method) {
      case 'S256':
      case 'plain':
        codeChallengeMethod = query.code_challenge_method;
        break;
      default:
        throw new InvalidRequest('The "code_challenge_method" must be "plain" or "S256"');
    }
  } else {
    codeChallengeMethod = query.code_challenge ? 'plain' : undefined;
  }

  return {
    responseType,
    clientId,
    redirectUri: query.redirect_uri ?? undefined,
    state: query.state ?? undefined,
    scope: query.scope ? query.scope.split(' ') : [],
    codeChallenge,
    codeChallengeMethod,
  };
}
