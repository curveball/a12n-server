import { Context, Middleware } from '@curveball/core';
import { NotFound, Unauthorized } from '@curveball/http-errors';
import BaseController from '../../base-controller';
import log from '../../log/service';
import { EventType } from '../../log/types';
import * as userService from '../../user/service';
import { User } from '../../user/types';
import { InvalidGrant, InvalidRequest, serializeError, UnsupportedGrantType } from '../errors';
import parseBasicAuth from '../parse-basic-auth';
import * as oauth2Service from '../service';
import { OAuth2Client } from '../types';

class TokenController extends BaseController {

  async post(ctx: Context) {

    const supportedGrantTypes = ['client_credentials', 'authorization_code', 'refresh_token', 'password'];
    const grantType = ctx.request.body.grant_type;

    if (!supportedGrantTypes.includes(grantType)) {
      throw new UnsupportedGrantType('The "grant_type" must be one of ' + supportedGrantTypes.join(', '));
    }

    const basicAuth = parseBasicAuth(ctx);
    let oauth2Client: OAuth2Client;

    try {
      oauth2Client = await oauth2Service.getClientByClientId(basicAuth[0]);
    } catch (e) {
      if (e instanceof NotFound) {
        throw new Unauthorized('Client id or secret incorrect', 'Basic');
      } else {
        // Rethrow
        throw e;
      }
    }
    if (!await oauth2Service.validateSecret(oauth2Client, basicAuth[1])) {
      throw new Unauthorized('Client id or secret incorrect', 'Basic');
    }

    if (!oauth2Client.allowedGrantTypes.includes(grantType)) {
      throw new UnsupportedGrantType('The current client is not allowed to use the ' + grantType + ' grant_type');
    }

    switch (grantType) {
      case 'authorization_code' :
        return this.authorizationCode(oauth2Client, ctx);
      case 'client_credentials' :
        return this.clientCredentials(oauth2Client, ctx);
      case 'password' :
        return this.password(oauth2Client, ctx);
      case 'refresh_token' :
        return this.refreshToken(oauth2Client, ctx);
    }

  }

  async clientCredentials(oauth2Client: OAuth2Client, ctx: Context) {

    const token = await oauth2Service.generateTokenForClient(oauth2Client);

    ctx.response.type = 'application/json';
    ctx.response.body = {
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
    };

  }

  async authorizationCode(oauth2Client: OAuth2Client, ctx: Context) {

    if (!ctx.request.body.code) {
      throw new InvalidRequest('The "code" property is required');
    }
    if (!ctx.request.body.redirect_uri) {
      throw new InvalidRequest('The "redirect_uri" property is required');
    }
    if (!await oauth2Service.validateRedirectUri(oauth2Client, ctx.request.body.redirect_uri)) {
      log(EventType.oauth2BadRedirect, ctx);
      throw new InvalidRequest('This value for "redirect_uri" is not recognized.');
    }
    const token = await oauth2Service.generateTokenFromCode(oauth2Client, ctx.request.body.code);

    ctx.response.type = 'application/json';
    ctx.response.body = {
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
    };

  }

  async password(oauth2Client: OAuth2Client, ctx: Context) {

    let user: User;
    try {
      user = await userService.findByIdentity('mailto:' + ctx.request.body.username);
    } catch (err) {
      throw new InvalidGrant('Unknown username or password');
    }

    if (!await userService.validatePassword(user, ctx.request.body.password)) {
      log(EventType.loginFailed, ctx.ip(), user.id);
      throw new InvalidGrant('Unknown username or password');
    }

    log(EventType.loginSuccess, ctx);

    const token = await oauth2Service.generateTokenForUser(
      oauth2Client,
      user
    );

    ctx.response.body = {
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
      refresh_token: token.refreshToken,
    };

  }

  async refreshToken(oauth2Client: OAuth2Client, ctx: Context) {

    if (!ctx.request.body.refresh_token) {
      throw new InvalidRequest('The "refresh_token" property is required');
    }

    const oldToken = await oauth2Service.getTokenByRefreshToken(
      ctx.request.body.refresh_token
    );

    if (oldToken.clientId !== oauth2Client.id) {
      throw new InvalidGrant('Refresh token was issued to a different client');
    }

    const token = await oauth2Service.generateTokenFromRefreshToken(
      oauth2Client,
      ctx.request.body.refresh_token
    );

    ctx.response.body = {
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
      refresh_token: token.refreshToken,
    };

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

function mw(): Middleware {
  const controller = new TokenController();
  return controller.dispatch.bind(controller);
}

export default mw();
