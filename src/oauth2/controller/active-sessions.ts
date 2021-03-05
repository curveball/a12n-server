import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';

import * as csv from '../formats/csv';

import * as userService from '../../user/service';
import * as oauth2Service from '../service';
import * as oauth2ClientService from '../../oauth2-client/service';
import * as privilegeService from '../../privilege/service';

import { OAuth2Client } from '../../oauth2-client/types';

class UserActiveSessions extends Controller {

  async get(ctx: Context<any>) {

    const user = await userService.findById(+ctx.params.id);
    if (ctx.state.user.id !== user.id && !await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('You can only use this API for yourself yourself, or if you have \'admin\' privileges');
    }

    const tokens = await oauth2Service.getActiveTokens(user);

    const clients = new Map<number, OAuth2Client>();
    for(const token of tokens) {
      clients.set(
        token.clientId,
        await oauth2ClientService.findById(token.clientId)
      );
    }

    ctx.response.status = 200;
    ctx.response.type = 'text/csv';
    ctx.response.body = csv.activeSessions(tokens, clients);

  }

}

export default new UserActiveSessions();
