import Controller from '@curveball/controller';
import { Context } from '@curveball/core';

import { Forbidden } from '@curveball/http-errors';

import { tokenResponse } from '../../oauth2/formats/json.js';

import * as tokenService from '../service.js';
import * as oauth2Service from '../../oauth2/service.js';
import * as oauth2ClientService from '../../oauth2-client/service.js';
import { PrincipalService } from '../../principal/service.js';

type OtteRequest = {
  activateUser?: boolean;
  token: string;
  client_id: string;
  dontExpire?: boolean;
}

class OneTimeTokenExchangeController extends Controller {

  async post(ctx: Context) {

    ctx.privileges.require('a12n:one-time-token:exchange');
    ctx.request.validate<OtteRequest>('https://curveballjs.org/schemas/a12nserver/one-time-token-exchange.json');

    const principalService = new PrincipalService(ctx.privileges);

    const client = await oauth2ClientService.findByClientId(ctx.request.body.client_id);
    if (!ctx.privileges.isPrincipal(client.app)) {
      throw new Forbidden(`The client_id ${ctx.request.body.client_id} is not associated with the currently authenticated app`);
    }
    const user = await tokenService.validateToken(
      ctx.request.body.token,
      ctx.request.body.dontExpire ?? false,
    );
    if (!user.active) {
      if (ctx.request.body.activateUser) {
        user.active = true;
        await principalService.save(user);
      } else {
        throw new Forbidden('The user associated with the one-time-token has been deactivated. Either activate the user first, or provide the "activateUser" property in the request if the intent is to activate the user with the one-time-token mechanism');
      }
    }

    const oauth2Token = await oauth2Service.generateTokenOneTimeToken({
      client,
      principal: user,
    });

    ctx.response.body = tokenResponse(oauth2Token);

  }

}

export default new OneTimeTokenExchangeController();
