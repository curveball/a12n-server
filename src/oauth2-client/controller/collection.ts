import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import { Forbidden, UnprocessableEntity } from '@curveball/http-errors';
import { findByApp, create } from '../service';
import * as userService from '../../user/service';
import { GrantType, OAuth2Client } from '../types';
import * as bcrypt from 'bcrypt';
import { App } from '../../user/types';
import { generateSecretToken } from '../../crypto';

class ClientCollectionController extends Controller {

  async get(ctx: Context) {

    const app = await userService.findById(+ctx.params.id) as App;
    if (app.id !== ctx.state.user.id) {
      if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
        throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
      }
    }

    const clients = await findByApp(app);
    ctx.response.body = hal.collection(app, clients);

  }

  async post(ctx: Context<any>) {

    const app = await userService.findById(+ctx.params.id);
    if (app.type !== 'app') {
      throw new Forbidden('You can only add oauth2 clients to \'app\' principals');
    }
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
      clientId = await generateSecretToken(10);
    } else if (clientId.length < 6) {
      throw new UnprocessableEntity('clientId must be at least 6 characters or left empty');
    }

    if (!allowedGrantTypes) {
      throw new UnprocessableEntity('You must specify the allowedGrantTypes property');
    }

    const clientSecret = await generateSecretToken();
    const newClient: Omit<OAuth2Client,'id'> = {
      clientId,
      app,
      allowedGrantTypes: allowedGrantTypes,
      clientSecret: await bcrypt.hash(clientSecret, 12),
    };

    const client = await create(newClient, redirectUris);
    ctx.response.body = hal.newClientSuccess(client, redirectUris, clientSecret);

  }

}

export default new ClientCollectionController();
