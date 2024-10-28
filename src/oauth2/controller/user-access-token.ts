import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';

import log from '../../log/service.js';
import { EventType } from '../../log/types.js';
import { PrincipalService } from '../../principal/service.js';
import * as oauth2Service from '../service.js';

class UserAccessTokenController extends Controller {

  async post(ctx: Context<any>) {

    const principalService = new PrincipalService(ctx.privileges);
    const user = await principalService.findByExternalId(ctx.params.id, 'user');

    if (!ctx.auth.equals(user) && !ctx.privileges.has('a12n:access-token:generate')) {
      throw new Forbidden('You can only generate OAuth2 access tokens for yourself with this endpoint (unless you have the \'a12n:access-token:generate\' privilege (which you haven\'t))');
    }

    const token = await oauth2Service.generateTokenDeveloperToken({
      principal: user,
    });

    ctx.response.body = {
      access_token: token.accessToken,
      token_type: token.tokenType,
      expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
    };
    log(EventType.generateAccessToken, ctx.ip()!, user.id, ctx.request.headers.get('User-Agent'));

  }

}

export default new UserAccessTokenController();
