import { Controller } from '@curveball/controller';
import { UnsupportedMediaType } from '@curveball/http-errors';
import { Context } from '@curveball/kernel';
import { AuthorizationChallengeRequest } from '../../api-types.ts';
import { getAppClientFromBasicAuth } from '../../app-client/service.ts';
import { UnauthorizedClient } from '../../oauth2/errors.ts';
import * as loginService from '../service.ts';

/**
 * The authorization challenge controller is an implementation of OAuth 2.0
 * for First-Party Applications.
 *
 * This specification is currently a draft, and so this endpoint will also
 * evolve as the specification evolves.
 *
 * The endpoint lets a first party, trusted app authenticate with an OAuth2
 * server and completely own UI.
 *
 * It's implemented as a series of requests and challenges until all
 * challenges are met. For example, a first challenge may be a password, a
 * second a TOTP token. Once there are no more challenges, a 'code' gets
 * returned which may be exchanged for a 'token' on the token endpoint.
 *
 * https://www.ietf.org/archive/id/draft-parecki-oauth-first-party-apps-00.html
 *
 */
class AuthorizationChallengeController extends Controller {

  async post(ctx: Context) {

    // We will only support Basic auth for now.
    const client = await getAppClientFromBasicAuth(ctx);

    if (!client.allowedGrantTypes.includes('authorization_challenge')) {
      throw new UnauthorizedClient('This client is not allowed to use the "authorization_challenge" oauth2 flow');
    }

    if (!ctx.request.is('application/x-www-form-urlencoded')) {
      throw new UnsupportedMediaType('This endpoint requires the request to use the "application/x-www-form-urlencoded" content-type');
    }

    ctx.request.validate<AuthorizationChallengeRequest>('https://curveballjs.org/schemas/a12nserver/authorization-challenge-request.json');

    const request = ctx.request.body;

    const session = await loginService.getSession(client, request);
    const code = await loginService.challenge(client, session, request);

    ctx.response.body = {
      authorization_code: code.code,
    };

  }

}



export default new AuthorizationChallengeController();
