import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { getLoggerFromContext } from '../../log/service.ts';
import { revokeByAccessRefreshToken } from '../service.ts';
import { AppClient } from '../../types.ts';
import {
  getAppClientFromBasicAuth,
  getAppClientFromBody,
} from '../../app-client/service.ts';


class RevokeController extends Controller {

  async post(ctx: Context<any>) {

    let oauth2Client: AppClient;

    if (ctx.request.headers.has('Authorization')) {
      oauth2Client = await getAppClientFromBasicAuth(ctx);
    } else {
      oauth2Client = await getAppClientFromBody(ctx);
    }

    const token = ctx.request.body.token;

    await revokeByAccessRefreshToken(oauth2Client, token);

    const log = getLoggerFromContext(ctx);
    await log('token-revoked');

    ctx.status = 200;

  }

}

export default new RevokeController();
