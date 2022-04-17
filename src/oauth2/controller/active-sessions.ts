import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden, NotFound } from '@curveball/http-errors';

import * as csv from '../formats/csv';

import * as principalService from '../../principal/service';
import * as oauth2Service from '../service';
import * as oauth2ClientService from '../../oauth2-client/service';
import * as privilegeService from '../../privilege/service';

import { Principal, User, App } from '../../principal/types';

import { OAuth2Client } from '../../oauth2-client/types';

class UserActiveSessions extends Controller {

  async get(ctx: Context<any>) {

    const user = await principalService.findByExternalId(ctx.params.id);
    if (ctx.auth.equals(user) && !await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('You can only use this API for yourself yourself, or if you have \'admin\' privileges');
    }

    if (!assertNotGroup(user)) {
      throw new NotFound('This endpoint only exists for users and apps');
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

function assertNotGroup(input: Principal): input is User | App {

  return ['user', 'app'].includes(input.type);

}


export default new UserActiveSessions();
