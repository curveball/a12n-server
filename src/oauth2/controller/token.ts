import { Context, Middleware } from '@curveball/core';
import { Unauthorized } from '@curveball/http-errors';
import BaseController from '../../base-controller';
import * as oauthErrors from '../errors';
import parseBasicAuth from '../parse-basic-auth';
import * as oauth2Service from '../service';

class TokenController extends BaseController {

  async post(ctx: Context) {

    if (ctx.request.body.grant_type !== 'client_credentials') {
      throw new oauthErrors.UnsupportedGrantType('The "grant_type" must be specified and must be "client_credentials"');
    }
    const basicAuth = parseBasicAuth(ctx);
    if (!basicAuth) {
      throw new Unauthorized('Basic Auth is missing or malformed', 'Basic');
    }
    const oauth2Client = await oauth2Service.getClientByClientId(basicAuth[0]);
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
