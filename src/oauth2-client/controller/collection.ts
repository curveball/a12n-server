import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as privilegeService from '../../privilege/service';
import * as hal from '../formats/hal';
import { Forbidden, UnprocessableEntity } from '@curveball/http-errors';
import { findByUser, create } from '../service';
import * as userService from '../../user/service';
import crypto from 'crypto';
import { GrantType, OAuth2Client } from '../types';
import bcrypt from 'bcrypt';

class ClientCollectionController extends Controller {

  async get(ctx: Context) {

    const user = await userService.findById(ctx.state.params.id);
    if (user.id !== ctx.state.user.id) {
      if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
        throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
      }
    }

    const clients = await findByUser(user);
    ctx.response.body = hal.collection(user, clients);

  }

  async post(ctx: Context<any>) {

    const user = await userService.findById(ctx.state.params.id);
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

    let clientId = ctx.request.body.clientId;

    const redirectUris = ctx.request.body.redirectUris.trim().split(/\r\n|\n/).filter((line:string) => !!line);

    if (!clientId) {
      clientId = randomId(10);
    } else if (clientId.length < 6) {
      throw new UnprocessableEntity('clientId must be at least 6 characters or left empty');
    }

    if (!allowedGrantTypes) {
      throw new UnprocessableEntity('You must specify the allowedGrantTypes property');
    }

    const clientSecret = randomId(20);
    const newClient: Omit<OAuth2Client,'id'> = {
      clientId,
      user,
      allowedGrantTypes: allowedGrantTypes,
      clientSecret: await bcrypt.hash(clientSecret, 12),
    };

    const client = await create(newClient, redirectUris);
    ctx.response.body = hal.newClientSuccess(client, redirectUris, clientSecret);

  }

}

function randomId(bytes: number): string {
  const buff = crypto.randomBytes(bytes);
  return buff.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export default new ClientCollectionController();
