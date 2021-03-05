import Controller from '@curveball/controller';
import { Context } from '@curveball/core';

import { Forbidden } from '@curveball/http-errors';

import { tokenResponse } from '../../oauth2/formats/json';

import * as privilegeService from '../../privilege/service';
import * as tokenService from '../service';
import * as oauth2Service from '../../oauth2/service';

class OneTimeTokenExchangeController extends Controller {

  async post(ctx: Context<any>) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege use this endpoint');
    }

    const user = await tokenService.validateToken(ctx.request.body.token);
    const oauth2Token = await oauth2Service.generateTokenForUserNoClient(user);

    ctx.response.body = tokenResponse(oauth2Token);

  }

}

export default new OneTimeTokenExchangeController();
