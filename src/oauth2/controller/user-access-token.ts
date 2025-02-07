import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';

import { getLoggerFromContext } from '../../log/service.js';
import { PrincipalService } from '../../principal/service.js';
import * as oauth2Service from '../service.js';
import { tokenResponse } from '../formats/json.js';

/**
 * The /user/x/access-token endpoint is used to generate one-off access
 * tokens for already authenticated users. This can be useful for
 * quick testing or debugging.
 *
 * They're also called 'developer tokens' in the codebase.
 */
class UserAccessTokenController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const user = await principalService.findByExternalId(ctx.params.id, 'user');

    if (!ctx.auth.equals(user) && !ctx.privileges.has('a12n:access-token:generate')) {
      throw new Forbidden('You can only generate OAuth2 access tokens for yourself with this endpoint (unless you have the \'a12n:access-token:generate\' privilege (which you haven\'t))');
    }

    ctx.response.body = {
      _templates: {
        'get-access-token': {
          method: 'POST',
          href: ctx.path,
          title: 'Generate access token',
          properties: [
            {
              name: 'scope',
              type: 'text',
              description: 'Space-separated list of scopes',
            },
          ],
        }
      }
    };

  }

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
    });
    ctx.response.body = tokenResponse(token);
    const log = getLoggerFromContext(ctx, user);
    await log('generate-access-token');

  }

}

export default new UserAccessTokenController();
