import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';

import log from '../../log/service.js';
import { EventType } from '../../log/types.js';
import { PrincipalService } from '../../principal/service.js';
import * as oauth2Service from '../service.js';
import { tokenResponse } from '../formats/json.js';

class UserAccessTokenController extends Controller {

  async post(ctx: Context<any>) {

    const principalService = new PrincipalService(ctx.privileges);
    const user = await principalService.findByExternalId(ctx.params.id, 'user');

    if (!ctx.auth.equals(user) && !ctx.privileges.has('a12n:access-token:generate')) {
      throw new Forbidden('You can only generate OAuth2 access tokens for yourself with this endpoint (unless you have the \'a12n:access-token:generate\' privilege (which you haven\'t))');
    }

    const token = await oauth2Service.generateTokenDeveloperToken({
      principal: user,
      scope: ctx.request.body?.scope?.split(' '),
      client: ctx.auth.appClient ?? undefined,
    },
    );
    ctx.response.body = tokenResponse(token);
    log(EventType.generateAccessToken, ctx.ip()!, user.id, ctx.request.headers.get('User-Agent'));

  }

}

export default new UserAccessTokenController();
