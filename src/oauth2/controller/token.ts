import { Context, Middleware } from '@curveball/core';
import { NotFound, Unauthorized } from '@curveball/http-errors';
import BaseController from '../../base-controller';
import log from '../../log/service';
import { EventType } from '../../log/types';
import { InvalidRequest, serializeError, UnsupportedGrantType } from '../errors';
import parseBasicAuth from '../parse-basic-auth';
import * as oauth2Service from '../service';

class TokenController extends BaseController {

  post(ctx: Context) {

    const supportedGrantTypes = ['client_credentials', 'authorization_code'];

    switch(ctx.request.body.grant_type) {
      case 'client_credentials' :
        return this.clientCredentials(ctx);
      case 'authorization_code' :
        return this.authorizationCode(ctx);
      default :
        throw new UnsupportedGrantType('The "grant_type" must be one of ' + supportedGrantTypes.join(', '));
    }

  }

  async clientCredentials(ctx: Context) {

    let oauth2Client;

    const basicAuth = parseBasicAuth(ctx);
    if (!basicAuth) {
      throw new Unauthorized('Basic Auth is missing or malformed', 'Basic');
    }
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

    const token = await oauth2Service.generateTokenForClient(oauth2Client);

    ctx.response.type = 'application/json';
    ctx.response.body = {
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
    };

  }

  async authorizationCode(ctx: Context) {

    let oauth2Client;

    const basicAuth = parseBasicAuth(ctx);
    if (!basicAuth) {
      throw new Unauthorized('Basic Auth is missing or malformed', 'Basic');
    }
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
