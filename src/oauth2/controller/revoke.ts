import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import log from '../../log/service';
import { EventType } from '../../log/types';
import { revokeByAccessRefreshToken } from '../service';
import { OAuth2Client } from '../../types';
import {
  getOAuth2ClientFromBasicAuth,
  getOAuth2ClientFromBody,
} from '../../oauth2-client/service';


class RevokeController extends Controller {

  async post(ctx: Context<any>) {

    let oauth2Client: OAuth2Client;

    if (ctx.request.headers.has('Authorization')) {
      oauth2Client = await getOAuth2ClientFromBasicAuth(ctx);
    } else {
      oauth2Client = await getOAuth2ClientFromBody(ctx);
    }

    const token = ctx.request.body.token;

    await revokeByAccessRefreshToken(oauth2Client, token);

    log(EventType.tokenRevoked, ctx);

    ctx.status = 200;

  }

}

export default new RevokeController();
