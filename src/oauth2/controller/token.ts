import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import log from '../../log/service';
import { EventType } from '../../log/types';
import * as userService from '../../user/service';
import { User } from '../../user/types';
import { InvalidGrant, InvalidRequest, serializeError, UnsupportedGrantType } from '../errors';
import * as oauth2Service from '../service';
import { OAuth2Client } from '../types';
import {
  getOAuth2ClientFromBasicAuth,
  getOAuth2ClientFromBody,
} from '../utilities';

class TokenController extends Controller {

  async post(ctx: Context) {

    this.sendCORSHeaders(ctx);

    const supportedGrantTypes = ['client_credentials', 'authorization_code', 'refresh_token', 'password'];
    const grantType = ctx.request.body.grant_type;

    if (!supportedGrantTypes.includes(grantType)) {
      throw new UnsupportedGrantType('The "grant_type" must be one of ' + supportedGrantTypes.join(', '));
    }

    let oauth2Client: OAuth2Client;

    switch (grantType) {

      case 'authorization_code' :
        oauth2Client = await getOAuth2ClientFromBody(ctx);
        break;
      case 'refresh_token' :
        if (ctx.request.headers.has('Authorization')) {
          oauth2Client = await getOAuth2ClientFromBasicAuth(ctx);
        } else {
          oauth2Client = await getOAuth2ClientFromBody(ctx);
        }
        break;
      default :
        oauth2Client = await getOAuth2ClientFromBasicAuth(ctx);
        break;

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
      refresh_token: token.refreshToken,
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

    if (!user.active) {
      log(EventType.loginFailedInactive, ctx.ip(), user.id, ctx.request.headers.get('User-Agent'))
      throw new InvalidGrant('User Inactive')
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

  async options(ctx: Context) {

    this.sendCORSHeaders(ctx);

  }

  sendCORSHeaders(ctx: Context) {

    ctx.response.headers.set('Access-Control-Allow-Origin', '*');

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

export default new TokenController();
