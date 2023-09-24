import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as principalService from '../../principal/service';
import { createToken } from '../service';
import * as hal from '../formats/hal';
import { resolve } from 'url';

class OneTimeTokenController extends Controller {

  async post(ctx: Context<any>) {

    ctx.privileges.require('admin');

    const user = await principalService.findByExternalId(ctx.params.id, 'user');

    const token = await createToken(user);
    const url = resolve(process.env.PUBLIC_URI!, 'reset-password/token/' + token.token);

    ctx.response.body = hal.oneTimeToken(user, url, token);

  }

}

export default new OneTimeTokenController();
