import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { NotFound } from '@curveball/http-errors';
import log from '../../log/service.js';
import { EventType } from '../../log/types.js';
import { PrincipalService } from '../../principal/service.js';
import * as userService from '../../user/service.js';
import { User, AppClient } from '../../types.js';
import { InvalidGrant, InvalidRequest, UnsupportedGrantType } from '../errors.js';
import * as oauth2Service from '../service.js';
import {
  getAppClientFromBasicAuth,
  getAppClientFromBody,
} from '../../app-client/service.js';
import * as userAppPermissions from '../../user-app-permissions/service.js';
import * as principalIdentityService from '../../principal-identity/service.js';

class TokenController extends Controller {

  async post(ctx: Context<any>) {

    this.sendCORSHeaders(ctx);

    const supportedGrantTypes = ['client_credentials', 'authorization_code', 'refresh_token', 'password'];
    const grantType = ctx.request.body.grant_type;

    if (!supportedGrantTypes.includes(grantType)) {
      throw new UnsupportedGrantType('The "grant_type" must be one of ' + supportedGrantTypes.join(', '));
    }

    let oauth2Client: AppClient;

    let secretUsed: boolean;
    if (ctx.request.headers.has('Authorization')) {
      oauth2Client = await getAppClientFromBasicAuth(ctx);
      secretUsed = true;
    } else {
      if (!['authorization_code', 'refresh_token'].includes(grantType)) {
        throw new InvalidRequest('A secret must be specified when using the client_credentials grant');
      }
      oauth2Client = await getAppClientFromBody(ctx);
      secretUsed = false;
    }

    if (!oauth2Client.allowedGrantTypes.includes(grantType)) {
      throw new UnsupportedGrantType('The current client is not allowed to use the ' + grantType + ' grant_type');
    }

    switch (grantType) {
      case 'authorization_code' :
        return this.authorizationCode(oauth2Client, ctx, secretUsed);
      case 'client_credentials' :
        return this.clientCredentials(oauth2Client, ctx);
      case 'password' :
        return this.password(oauth2Client, ctx);
      case 'refresh_token' :
        return this.refreshToken(oauth2Client, ctx);
    }

  }

  async clientCredentials(oauth2Client: AppClient, ctx: Context) {

    const token = await oauth2Service.generateTokenClientCredentials({
      client: oauth2Client,
      scope: ctx.request.body.scope?.split(' ') ?? [],
    });

    ctx.response.type = 'application/json';
    ctx.response.body = {
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
    };

  }

  async authorizationCode(oauth2Client: AppClient, ctx: Context<any>, secretUsed: boolean) {

    if (!ctx.request.body.code) {
      throw new InvalidRequest('The "code" property is required');
    }

    const token = await oauth2Service.generateTokenAuthorizationCode({
      client: oauth2Client,
      code: ctx.request.body.code,
      codeVerifier: ctx.request.body.code_verifier,
      secretUsed,
      redirectUri: ctx.request.body.redirect_uri ?? null,
    });

    ctx.response.type = 'application/json';
    ctx.response.body = {
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
      refresh_token: token.refreshToken,
      id_token: token.idToken,
    };

  }

  async password(oauth2Client: AppClient, ctx: Context<any>) {

    let identity;
    let user: User;
    const principalService = new PrincipalService('insecure');
    try {
      identity = await principalIdentityService.findByUri('mailto:' + ctx.request.body.username);
    } catch (err) {
      if (err instanceof NotFound) {
        throw new InvalidGrant('Unknown username or password');
      } else {
        throw err;
      }
    }
    if (!identity.verifiedAt) {
      throw new InvalidGrant(`${ctx.request.body.username} has not been verified`);
    }
    try {
      user = await principalService.findByIdentity(identity) as User;
      if (user.type !== 'user') {
        throw new InvalidRequest('The "password" grant type is only valid for users');
      }
    } catch (err) {
      throw new InvalidGrant('Unknown username or password');
    }

    if (!await userService.validatePassword(user, ctx.request.body.password)) {
      await log(
        EventType.loginFailed,
        ctx.ip(),
        user.id
      );
      throw new InvalidGrant('Unknown username or password');
    }

    if (!user.active) {
      await log(
        EventType.loginFailedInactive,
        ctx.ip(),
        user.id,
        ctx.request.headers.get('User-Agent')!
      );
      throw new InvalidGrant('User Inactive');
    }

    await log(
      EventType.loginSuccess,
      ctx.ip(),
      user.id,
      ctx.request.headers.get('User-Agent')!
    );

    const scope: string[] = ctx.request.body.scope?.split(' ') ?? [];

    await userAppPermissions.setPermissions(
      oauth2Client.app,
      user,
      scope,
    );

    const token = await oauth2Service.generateTokenPassword({
      client: oauth2Client,
      principal: user,
      scope
    });

    ctx.response.type = 'application/json';
    ctx.response.body = {
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
      refresh_token: token.refreshToken,
    };

  }

  async refreshToken(oauth2Client: AppClient, ctx: Context<any>) {

    if (!ctx.request.body.refresh_token) {
      throw new InvalidRequest('The "refresh_token" property is required');
    }

    const token = await oauth2Service.generateTokenFromRefreshToken(
      oauth2Client,
      ctx.request.body.refresh_token
    );

    ctx.response.type = 'application/json';
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
