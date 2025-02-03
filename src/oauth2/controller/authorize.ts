import * as querystring from 'querystring';
import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';

import { InvalidClient, InvalidRequest, LoginRequired, UnsupportedGrantType } from '../errors.js';
import * as oauth2Service from '../service.js';
import { AppClient } from '../../types.js';
import { getLoggerFromContext } from '../../log/service.js';
import { findByClientId } from '../../app-client/service.js';
import * as userAppPermissions from '../../user-app-permissions/service.js';
import { generateJWTIDToken } from '../jwt.js';
import * as services from '../../services.js';
import { parseAuthorizationQuery } from '../util.js';
import { AuthorizeParamsCode, AuthorizeParamsToken } from '../types.js';

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

    const log = getLoggerFromContext(ctx);
    try {
      await oauth2Service.requireRedirectUri(oauth2Client, params.redirectUri);
    } catch (err) {
      await log('oauth2-badredirect');
      throw err;
    }

    if (ctx.session.user === undefined) {

      // Use is not logged in, we need to send them through the login process
      // first. The user will come back here after.

      if ((params.responseType === 'code' || params.responseType === 'code id_token') && params.prompt?.includes('none')) {
        throw new LoginRequired('The client requested that the user not be prompted for login, but the user is not logged in.');
      }

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
      redirectUri: params.redirectUri ?? null,
      grantType: params.grantType,
      codeChallenge: params.codeChallenge ?? null,
      codeChallengeMethod: params.codeChallengeMethod ?? null,
      browserSessionId: ctx.sessionId!,
      nonce: params.nonce ?? null,
    });

    const identities = await services.principalIdentity.findByPrincipal(ctx.session.user);

    const redirectParams: Record<string, string> = {
      code: code.code,
    };
    if (params.state) redirectParams.state = params.state;

    if (params.responseType === 'code id_token') {
      redirectParams.id_token = await generateJWTIDToken({
        principal: ctx.session.user,
        client: oauth2Client,
        nonce: params.nonce ?? null,
        identities,
        loginTime: ctx.session.loginTime,
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

