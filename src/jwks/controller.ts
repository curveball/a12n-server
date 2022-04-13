import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Jwks } from './types';
import { getPublicKey } from '../oauth2/jwt';

class JwksController extends Controller {

  get(ctx: Context) {

    ctx.response.type = 'application/json';

    const jwks: Jwks = {
      keys: [
        {
          kid: 'blabla',
          alg: 'RS256',
          use: 'sig',
          ...getPublicKey().export({
            format: 'jwk'
          })
        }
      ],

    };

    ctx.response.body = jwks;

  }

}


export default new JwksController();
