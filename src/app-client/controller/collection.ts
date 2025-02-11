import * as bcrypt from 'bcrypt';
import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden, UnprocessableContent } from '@curveball/http-errors';

import * as hal from '../formats/hal.ts';
import { PrincipalService } from '../../principal/service.ts';
import { GrantType, AppClient } from '../../types.ts';
import { findByApp, create } from '../service.ts';
import { generatePublicId, generateSecretToken } from '../../crypto.ts';
import { AppClientNewFormBody } from '../../api-types.ts';

class ClientCollectionController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const app = await principalService.findByExternalId(ctx.params.id, 'app');
    if (ctx.auth.equals(app)) {
      if (!ctx.privileges.has('admin')) {
        throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
      }
    }

    const clients = await findByApp(app);
    ctx.response.body = hal.collection(app, clients);

  }

  async post(ctx: Context) {

    ctx.request.validate<AppClientNewFormBody>('https://curveballjs.org/schemas/a12nserver/app-client-new-form.json');
    const principalService = new PrincipalService(ctx.privileges);
    const app = await principalService.findByExternalId(ctx.params.id, 'app');
    if (!ctx.privileges.has('admin')) {
      throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
    }

    const allowedGrantTypes: GrantType[] = [];

    if (ctx.request.body.allowClientCredentials) {
      allowedGrantTypes.push('client_credentials');
    }
    if (ctx.request.body.allowAuthorizationCode || ctx.request.body.allowAuthorizationChallenge) {
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
    if (ctx.request.body.allowAuthorizationChallenge) {
      allowedGrantTypes.push('authorization_challenge');
    }

    let clientId = ctx.request.body.clientId;

    let redirectUris:string[] = [];
    if (ctx.request.body.redirectUris) {
      redirectUris = ctx.request.body.redirectUris.trim().split(/\r\n|\n/).filter((line:string) => !!line);
    }

    if (!clientId) {
      clientId = await generatePublicId();
    } else if (clientId.length < 6) {
      throw new UnprocessableContent('clientId must be at least 6 characters or left empty');
    }

    if (!allowedGrantTypes) {
      throw new UnprocessableContent('You must specify the allowedGrantTypes property');
    }

    const clientSecret = `secret-token:${await generateSecretToken()}`;
    const newClient: Omit<AppClient,'id'|'href'> = {
      clientId,
      app,
      allowedGrantTypes: allowedGrantTypes,
      clientSecret: await bcrypt.hash(clientSecret, 12),
      requirePkce: !!ctx.request.body.requirePkce,
    };

    const client = await create(newClient, redirectUris);
    ctx.response.body = hal.newClientSuccess(client, redirectUris, clientSecret);

  }

}

export default new ClientCollectionController();
