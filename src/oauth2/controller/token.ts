import { Context, Middleware } from '@curveball/core';
import { BadRequest, Unauthorized } from '@curveball/http-errors';
import BaseController from '../../base-controller';
import log from '../../log/service';
import { EventType } from '../../log/types';
import * as oauthErrors from '../errors';
import parseBasicAuth from '../parse-basic-auth';
import * as oauth2Service from '../service';
import { OAuth2Token } from '../types';

class TokenController extends BaseController {

  async post(ctx: Context) {

    const supportedGrantTypes = ['client_credentials', 'authorization_code'];

    if (!supportedGrantTypes.includes(ctx.request.body.grant_type)) {
      throw new oauthErrors.UnsupportedGrantType('The "grant_type" must be one of ' + supportedGrantTypes.join(', '));
    }
    const basicAuth = parseBasicAuth(ctx);
    if (!basicAuth) {
      throw new Unauthorized('Basic Auth is missing or malformed', 'Basic');
    }
    const oauth2Client = await oauth2Service.getClientByClientId(basicAuth[0]);
    if (!await oauth2Service.validateSecret(oauth2Client, basicAuth[1])) {
      throw new Unauthorized('Client id or secret incorrect', 'Basic');
    }

    console.log(ctx.request.headers.get('accept'));
    let token: OAuth2Token;

    switch (ctx.request.body.grant_type) {

      case 'client_credentials' :
        token = await oauth2Service.generateTokenForClient(oauth2Client);
        break;
      case 'authorization_code' :
        if (!ctx.request.body.code) {
          throw new BadRequest('The "code" property is required');
        }
        if (!ctx.request.body.redirect_uri) {
          throw new BadRequest('The "redirect_uri" property is required');
        }
        if (!await oauth2Service.validateRedirectUri(oauth2Client, ctx.request.body.redirect_uri)) {
          log(EventType.oauth2BadRedirect, ctx);
          throw new BadRequest('This value for "redirect_uri" is not recognized.');
        }
        token = await oauth2Service.generateTokenFromCode(oauth2Client, ctx.request.body.code);
        break;

    }

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
        console.log(err);
        oauthErrors.serializeError(ctx, err);
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
