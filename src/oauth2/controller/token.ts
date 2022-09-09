import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import log from '../../log/service';
import { EventType } from '../../log/types';
import * as principalService from '../../principal/service';
import * as userService from '../../user/service';
import { User } from '../../principal/types';
import { InvalidGrant, InvalidRequest, UnsupportedGrantType } from '../errors';
import * as oauth2Service from '../service';
import { OAuth2Client } from '../../oauth2-client/types';
import {
  getOAuth2ClientFromBasicAuth,
  getOAuth2ClientFromBody,
} from '../../oauth2-client/service';

class TokenController extends Controller {

  async post(ctx: Context<any>) {

    this.sendCORSHeaders(ctx);

    const supportedGrantTypes = ['client_credentials', 'authorization_code', 'refresh_token', 'password'];
    const grantType = ctx.request.body.grant_type;

    if (!supportedGrantTypes.includes(grantType)) {
      throw new UnsupportedGrantType('The "grant_type" must be one of ' + supportedGrantTypes.join(', '));
    }

    let oauth2Client: OAuth2Client;

    switch (grantType) {

      case 'authorization_code' :
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

  async authorizationCode(oauth2Client: OAuth2Client, ctx: Context<any>) {

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
    const token = await oauth2Service.generateTokenFromCode(oauth2Client, ctx.request.body.code, ctx.request.body.code_verifier);

    ctx.response.type = 'application/json';
    ctx.response.body = {
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
      refresh_token: token.refreshToken,
    };

  }

  async password(oauth2Client: OAuth2Client, ctx: Context<any>) {

    let user: User;
    try {
      user = await principalService.findByIdentity('mailto:' + ctx.request.body.username) as User;
      if (user.type !== 'user') {
        throw new InvalidRequest('The "password" grant type is only valid for users');
      }
    } catch (err) {
      throw new InvalidGrant('Unknown username or password');
    }

    if (!await userService.validatePassword(user, ctx.request.body.password)) {
      log(EventType.loginFailed, ctx.ip(), user.id);
      throw new InvalidGrant('Unknown username or password');
    }

    if (!user.active) {
      log(EventType.loginFailedInactive, ctx.ip(), user.id, ctx.request.headers.get('User-Agent')!);
      throw new InvalidGrant('User Inactive');
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

  async refreshToken(oauth2Client: OAuth2Client, ctx: Context<any>) {

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

    ctx.status = 200;
    this.sendCORSHeaders(ctx);

  }

  sendCORSHeaders(ctx: Context) {

    ctx.response.headers.set('Access-Control-Allow-Origin', '*');

  }

}

export default new TokenController();
