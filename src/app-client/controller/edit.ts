import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal.ts';
import { Forbidden, NotFound, UnprocessableContent } from '@curveball/http-errors';
import { PrincipalService } from '../../principal/service.ts';
import { findByClientId, edit } from '../service.ts';
import * as oauth2Service from '../../oauth2/service.ts';
import { GrantType } from '../../types.ts';
import { AppClientEditFormBody } from '../../api-types.ts';

class EditClientController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const app = await principalService.findByExternalId(ctx.params.id, 'app');
    if (!ctx.privileges.has('admin')) {
      throw new Forbidden('Only users with the "admin" privilege can add new OAuth2 clients');
    }

    const client = await findByClientId(ctx.params.clientId);
    if (client.app.id !== app.id) {
      throw new NotFound('OAuth2 client not found');
    }

    ctx.response.body = hal.editForm(client, await oauth2Service.getRedirectUris(client));

  }

  async post(ctx: Context<any>) {

    ctx.request.validate<AppClientEditFormBody>('https://curveballjs.org/schemas/a12nserver/app-client-edit-form.json');
    const principalService = new PrincipalService(ctx.privileges);
    const app = await principalService.findByExternalId(ctx.params.id, 'app');
    if (!ctx.privileges.has('admin')) {
      throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
    }
    const client = await findByClientId(ctx.params.clientId);
    if (client.app.id !== app.id) {
      throw new NotFound('OAuth2 client not found');
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

    let redirectUris: string[] = [];
    if (ctx.request.body.redirectUris && typeof ctx.request.body.redirectUris === 'string') {
      redirectUris = ctx.request.body.redirectUris.trim().split(/\r\n|\n/).filter((line:string) => !!line);
    }

    if (!allowedGrantTypes) {
      throw new UnprocessableContent('You must specify the allowedGrantTypes property');
    }

    client.allowedGrantTypes = allowedGrantTypes;
    client.requirePkce = !!ctx.request.body.requirePkce;

    await edit(client, redirectUris);
    ctx.redirect(303, client.href);

  }

}

export default new EditClientController();
