import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as hal from '../formats/hal.js';
import { resolve } from 'url';
import { VerificationTokenGenerateRequest } from '../../api-types.js';
import * as services from '../../services.js';

class OneTimeTokenController extends Controller {

  async post(ctx: Context) {

    ctx.request.validate<VerificationTokenGenerateRequest>('https://curveballjs.org/schemas/a12nserver/verification-token-generate.json');
    ctx.privileges.require('a12n:one-time-token:generate');

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const user = await principalService.findByExternalId(ctx.params.id, 'user');

    let identity = null;

    if (ctx.request.body.identity) {
      identity = await services.principalIdentity.findByUri(user, ctx.request.body.identity);
    }

    const token = await services.verificationToken.createToken(
      user,
      ctx.request.body.expiresIn ?? null,
      identity,
    );
    const url = resolve(ctx.request.origin, 'reset-password/token/' + token.token);

    ctx.response.body = hal.oneTimeToken(user, url, token);

  }

}

export default new OneTimeTokenController();
