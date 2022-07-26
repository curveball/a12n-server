import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import { Forbidden, UnprocessableEntity, Conflict } from '@curveball/http-errors';
import { findByApp, create } from '../service';
import * as principalService from '../../principal/service';
import { GrantType, OAuth2Client } from '../types';
import * as bcrypt from 'bcrypt';
import { generatePublicId, generateSecretToken } from '../../crypto';
import { UniqueViolationError } from 'db-errors';

class ClientCollectionController extends Controller {

  async get(ctx: Context) {

    const app = await principalService.findByExternalId(ctx.params.id, 'app');
    if (ctx.auth.equals(app)) {
      if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
        throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
      }
    }

    const clients = await findByApp(app);
    ctx.response.body = hal.collection(app, clients);

  }

  async post(ctx: Context<any>) {

    const app = await principalService.findByExternalId(ctx.params.id, 'app');
    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
    }

    const allowedGrantTypes: GrantType[] = [];

    if (ctx.request.body.allowClientCredentials) {
      allowedGrantTypes.push('client_credentials');
    }
    if (ctx.request.body.allowAuthorizationCode) {
      allowedGrantTypes.push('authorization_code');
    }
    if (ctx.request.body.allowImplicit) {
      allowedGrantTypes.push('implicit');
    }
    if (ctx.request.body.allowRefreshToken) {
      allowedGrantTypes.push('refresh_token');
    }
    if (ctx.request.body.allowPassword) {
      allowedGrantTypes.push('password');
    }

    let clientId = ctx.request.body.clientId;

    const redirectUris = ctx.request.body.redirectUris.trim().split(/\r\n|\n/).filter((line:string) => !!line);

    if (!clientId) {
      clientId = await generatePublicId();
    } else if (clientId.length < 6) {
      throw new UnprocessableEntity('clientId must be at least 6 characters or left empty');
    }

    if (!allowedGrantTypes) {
      throw new UnprocessableEntity('You must specify the allowedGrantTypes property');
    }

    const clientSecret = `secret-token:${await generateSecretToken()}`;
    const newClient: Omit<OAuth2Client,'id'|'href'> = {
      clientId,
      app,
      allowedGrantTypes: allowedGrantTypes,
      clientSecret: await bcrypt.hash(clientSecret, 12),
      requirePkce: ctx.request.body.requirePkce ?? false,
    };

    // If client id already exists in DB, throw error.
    try {
      const client = await create(newClient, redirectUris);
      ctx.response.body = hal.newClientSuccess(client, redirectUris, clientSecret);
    } catch (error: any) {
      if (error instanceof UniqueViolationError) {
        throw new Conflict('Client ID already exists');
      } else {
        throw error;
      }
    }

  }

}

export default new ClientCollectionController();
