import Controller, { accept, method } from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden, NotFound, NotImplemented } from '@curveball/http-errors';

import * as csv from '../formats/csv.js';

import { PrincipalService } from '../../principal/service.js';
import * as oauth2Service from '../service.js';
import * as oauth2ClientService from '../../app-client/service.js';

import {
  App,
  AppClient,
  Principal,
  User,
} from '../../types.js';

import { OAuth2Token } from '../types.js';

class ActiveSessions extends Controller {

  @accept('text/csv')
  @method('GET')
  async getCsv(ctx: Context) {

    const [, tokens, clients] = await this.getData(ctx);

    ctx.status = 200;
    ctx.response.type = 'text/csv';
    ctx.response.body = csv.activeSessions(tokens, clients);
    ctx.response.links.add({
      rel: 'alternate',
      href: ctx.path,
      type: 'application/json',
    });

  }

  @accept('json')
  @method('GET')
  async getHal(ctx: Context) {

    throw new NotImplemented('This feature is not yet implemented');

  }

  private async getData(ctx: Context): Promise<[Principal, OAuth2Token[], Map<number, AppClient|null>]> {

    const principalService = new PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id);
    if (ctx.auth.equals(principal) && !ctx.privileges.has('admin')) {
      throw new Forbidden('You can only use this API for yourself yourself, or if you have \'admin\' privileges');
    }

    if (!assertNotGroup(principal)) {
      throw new NotFound('This endpoint only exists for users and apps');
    }

    const tokens = await oauth2Service.getActiveTokens(principal);

    const clients = new Map<number, AppClient|null>();
    for(const token of tokens) {

      if (token.clientId !== 0 && !clients.has(token.clientId)) {

        try {
          const client = await oauth2ClientService.findById(token.clientId);
          clients.set(
            token.clientId,
            client,
          );
        } catch (e: any) {
          if (e instanceof NotFound) {
            console.warn('Encountered an active token in the database, with no associated oauth2 client');
            clients.set(token.clientId, null);
          } else {
            throw e;
          }
        }

      }
    }

    return [principal, tokens, clients];

  }

}



function assertNotGroup(input: Principal): input is User | App {

  return ['user', 'app'].includes(input.type);

}

export default new ActiveSessions();
