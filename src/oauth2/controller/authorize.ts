import * as querystring from 'querystring';
import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound, NotImplemented } from '@curveball/http-errors';

import { InvalidClient, InvalidRequest, UnsupportedGrantType } from '../errors.js';
import * as oauth2Service from '../service.js';
import { CodeChallengeMethod } from '../types.js';
import { AppClient } from '../../types.js';
import log from '../../log/service.js';
import { EventType } from '../../log/types.js';
import { findByClientId } from '../../app-client/service.js';
import * as userAppPermissions from '../../user-app-permissions/service.js';
import { generateJWTIDToken } from '../jwt.js';

/**
 * The Authorize controller is responsible for handing requests to the oauth2
 * authorize endpoint.
 *
 * There are 2 oauth2 grant types handled here: 'implicit' and
 * 'authorization_code'. Implicit is disabled by default and will probably
 * be removed from a future version.
 */
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

    const grantType = params.responseType === 'token' ? 'implicit' :  'authorization_code';

    if (!oauth2Client.allowedGrantTypes.includes(grantType)) {
      throw new UnsupportedGrantType('The current client is not allowed to use the ' + grantType + ' grant_type');
    }

    try {
      await oauth2Service.requireRedirectUri(oauth2Client, params.redirectUri);
    } catch (err) {
      await log(EventType.oauth2BadRedirect, ctx);
      throw err;
    }

    if (ctx.session.user === undefined) {
      // Use is not logged in, we need to send them through the login process
      // first. The user will come back here after.
      this.redirectToLogin(ctx, {'continue': ctx.request.requestTarget});
      return;
    }

    await userAppPermissions.setPermissions(
      oauth2Client.app,
      ctx.session.user,
      params.scope,
    );
    if (params.responseType === 'token') {
      return this.tokenRedirect(ctx, oauth2Client, params);
    } else {

      if (oauth2Client.requirePkce && !params.codeChallenge) {
        throw new InvalidRequest('This endpoint requires that OAuth2 client support PKCE, and your client did not pass the correct parameters. Either turn off the PKCE requirement for this OAuth2 client, or upgrade to an OAuth2 client library that supports PKCE.');
      }
      return this.codeRedirect(ctx, oauth2Client, params);
    }

  }

  async tokenRedirect(ctx: Context, oauth2Client: AppClient, params: AuthorizeParamsToken) {

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
      params.redirectUri + (params.responseMode === 'query' ? '?' : '#') + querystring.stringify({
        access_token: token.accessToken,
        token_type: token.tokenType,
        expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
        state: params.state
      })
    );

  }

  async codeRedirect(
    ctx: Context,
    oauth2Client: AppClient,
    params: AuthorizeParamsCode
  ) {

    const code = await oauth2Service.generateAuthorizationCode({
      client: oauth2Client,
      principal: ctx.session.user,
      scope: params.scope,
      codeChallenge: params.codeChallenge ?? null,
      codeChallengeMethod: params.codeChallengeMethod ?? null,
      browserSessionId: ctx.sessionId!,
      nonce: params.nonce ?? null,
    });

    const redirectParams: Record<string, string> = {
      code: code.code,
    };
    if (params.state) redirectParams.state = params.state;

    if (params.responseType === 'code id_token') {
      redirectParams.id_token = await generateJWTIDToken({
        principal: ctx.session.user,
        client: oauth2Client,
        nonce: params.nonce ?? null,
      });
    }

    ctx.status = 302;
    ctx.response.headers.set('Cache-Control', 'no-cache');
    ctx.response.headers.set(
      'Location',
      params.redirectUri + (params.responseMode === 'query' ? '?' : '#') + querystring.stringify(redirectParams)
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

type AuthorizeParamsDisplay = 'page' | 'popup' | 'touch' | 'wap';

type AuthorizeParamsCode = {
  responseType: 'code' | 'code id_token';
  clientId: string;
  redirectUri?: string;
  scope: string[];
  state?: string;

  /**
   * See https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html
   */
  responseMode: OAuth2ResponseMode;

  // PCKE extension
  codeChallenge?: string;
  codeChallengeMethod?: CodeChallengeMethod;

  // OpenID Connect extension
  nonce?: string;
  display?: AuthorizeParamsDisplay;
};

type AuthorizeParamsToken = {
  responseType: 'token';
  clientId: string;
  redirectUri?: string;
  scope: string[];
  state?: string;

  /**
   * See https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html
   */
  responseMode: OAuth2ResponseMode;
}

type AuthorizeParams = AuthorizeParamsCode | AuthorizeParamsToken;

/**
 * The sole goal of this function parse and validate query string parameters.
 */
function parseAuthorizationQuery(query: Record<string, string>): AuthorizeParams {

  if (!['token', 'code', 'code id_token'].includes(query.response_type)) {
    throw new InvalidRequest('The "response_type" parameter must be provided, and must be "token" or "code"');
  }
  const responseType: 'code' | 'token' = query.response_type as any;
  if (!query.client_id) {
    throw new InvalidRequest('The "client_id" parameter must be provided');
  }
  const clientId = query.client_id;

  /**
   * These are all OpenID parameters that we don't support right now. We're
   * throwing an error to make sure we're not incorrectly implementing
   * OpenID Connect while this is still in progress.
   */
  const notSupportedParams = [
    'prompt',
    'max_age',
    'ui_locales',
    'id_token_hint',
    'login_hint',
    'acr_values',
  ];

  for(const param of notSupportedParams) {
    if (param in query) {
      throw new NotImplemented(`The "${param}" parameter is currently not implemented. Want support for this? Open a ticket.`);
    }
  }

  let responseMode: OAuth2ResponseMode;
  if (query.response_mode) {
    if (!isResponseMode(query.response_mode)) {
      throw new InvalidRequest('Only "query" and "fragment" are currently supported by this server for the "response_mode" parameter');
    }
    responseMode = query.response_mode;
  } else {
    responseMode = responseType === 'token' ? 'fragment' : 'query';
  }

  if (responseType === 'token') {
    return {
      responseType,
      clientId,
      redirectUri: query.redirect_uri ?? undefined,
      state: query.state ?? undefined,
      scope: query.scope ? query.scope.split(' ') : [],
      responseMode,
    };
  }

  const scope = query.scope ? query.scope.split(' ') : [];

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

  const displayOptions = ['page', 'popup', 'touch', 'wap'] as const;
  const display =
    query.display && displayOptions.includes(query.display as any) ?
    query.display as AuthorizeParamsDisplay : undefined;

  if (query.responseMode && query.responseMode !== 'query') {
    throw new NotImplemented('The only supported value for "response_mode" is currently "query"');
  }

  return {
    responseType,
    clientId,
    redirectUri: query.redirect_uri ?? undefined,
    state: query.state ?? undefined,
    scope,
    responseMode,
    codeChallenge,
    codeChallengeMethod,

    display,
    nonce: query.nonce ?? undefined,
  };
}

type OAuth2ResponseMode = 'query' | 'fragment';

function isResponseMode(input: string): input is OAuth2ResponseMode {

  return (input === 'query' || input === 'fragment');

}
