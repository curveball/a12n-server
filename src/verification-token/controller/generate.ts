import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { PrincipalService } from '../../principal/service.js';
import { createToken } from '../service.js';
import * as hal from '../formats/hal.js';
import { resolve } from 'url';

type GenerateRequest = {
  expiresIn?: number;
}

class OneTimeTokenController extends Controller {

  async post(ctx: Context) {

    ctx.request.validate<GenerateRequest>('https://curveballjs.org/schemas/a12nserver/one-time-token-generate.json');
    ctx.privileges.require('a12n:one-time-token:generate');

    const principalService = new PrincipalService(ctx.privileges);
    const user = await principalService.findByExternalId(ctx.params.id, 'user');

    const token = await createToken(
      user,
      ctx.request.body.expiresIn ?? null,
      null,
    );
    const url = resolve(ctx.request.origin, 'reset-password/token/' + token.token);

    ctx.response.body = hal.oneTimeToken(user, url, token);

  }

}

export default new OneTimeTokenController();
