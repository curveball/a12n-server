import Controller from '@curveball/controller';
import { Context } from '@curveball/core';

import { Forbidden, UnprocessableEntity } from '@curveball/http-errors';

import { tokenResponse } from '../../oauth2/formats/json';

import * as tokenService from '../service';
import * as oauth2Service from '../../oauth2/service';
import * as oauth2ClientService from '../../oauth2-client/service';
import { PrincipalService } from '../../principal/service';

type OtteRequest = {
  activateUser?: boolean;
  token: string;
  client_id: string;
}

class OneTimeTokenExchangeController extends Controller {

  async post(ctx: Context<OtteRequest>) {

    ctx.privileges.require('a12n:one-time-token:exchange');
    const principalService = new PrincipalService(ctx.privileges);

    if (!ctx.request.body.token) {
      throw new UnprocessableEntity('A token must be provided for the exchange');
    }
    if (!ctx.request.body.client_id) {
      throw new UnprocessableEntity('A client_id must be provided for the exchange');
    }

    const user = await tokenService.validateToken(ctx.request.body.token);

    if (!user.active) {
      if (ctx.request.body.activateUser) {
        user.active = true;
        await principalService.save(user);
      } else {
        throw new Forbidden('The user associated with the one-time-token has been deactivated. Either activate the user first, or provide the "activateUser" property in the request if the intent is to activate the user with the one-time-token mechanism');
      }
    }

    const client = await oauth2ClientService.findByClientId(ctx.request.body.client_id);
    const oauth2Token = await oauth2Service.generateTokenOneTimeToken({
      client,
      principal: user,
    });

    ctx.response.body = tokenResponse(oauth2Token);

  }

}

export default new OneTimeTokenExchangeController();
