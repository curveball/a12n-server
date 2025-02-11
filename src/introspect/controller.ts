import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { UnprocessableContent, UnsupportedMediaType } from '@curveball/http-errors';
import { NotFound } from '@curveball/http-errors';
import * as oauth2Service from '../oauth2/service.ts';
import { OAuth2Token } from '../oauth2/types.ts';
import * as privilegeService from '../privilege/service.ts';
import * as oauth2ClientService from '../app-client/service.ts';
import { introspectResponse, inactive } from './formats/json.ts';

/**
 * The /introspect endpoint allows a client to get more information
 * about an issued access or refresh token.
 *
 * This is an implementation of RFC7662: OAuth 2.0 Token Introspection
 */
class IntrospectionController extends Controller {

  async post(ctx: Context<any>) {

    if (!ctx.request.is('application/x-www-form-urlencoded')) {
      throw new UnsupportedMediaType('This endpoint only supports application/x-www-form-urlencoded');
    }

    if (!('token' in ctx.request.body)) {
      throw new UnprocessableContent('The "token" parameter must be set');
    }

    const token = ctx.request.body.token;
    const tokenTypeHint = ctx.request.body.token_type_hint || null;

    ctx.response.type = 'application/json';

    let foundToken: OAuth2Token|null = null;
    let foundTokenType: string;

    if (tokenTypeHint === null || tokenTypeHint === 'access_token') {

      try {

        foundToken = await oauth2Service.getTokenByAccessToken(token);
        foundTokenType = 'accessToken';

      } catch (err) {

        if (!(err instanceof NotFound)) {
          // Rethrowing everything except 'not found'
          throw err;
        }

      }

    }
    if (tokenTypeHint === null || tokenTypeHint === 'refresh_token') {

      try {

        foundToken = await oauth2Service.getTokenByRefreshToken(token);
        foundTokenType = 'refreshToken';

      } catch (err) {

        if (!(err instanceof NotFound)) {
          // Rethrowing everything except 'not found'
          throw err;
        }

      }

    }
    if (foundToken) {
      const privileges = (await privilegeService.get(foundToken.principal)).getAll();
      // For 'developer tokens' clientId will be 0.
      const client = foundToken.clientId !== 0 ? await oauth2ClientService.findById(foundToken.clientId) : undefined;

      switch (foundTokenType!) {

        case 'accessToken' :
          ctx.response.body = introspectResponse({
            tokenType: 'bearer',
            origin: ctx.request.origin,
            token: foundToken,
            client,
            privileges,
          });
          break;
        case 'refreshToken' :
          ctx.response.body = introspectResponse({
            tokenType: 'refresh_token',
            origin: ctx.request.origin,
            token: foundToken,
            client,
            privileges,
          });
          break;
      }
      return;
    }

    ctx.response.body = inactive();

  }

}

export default new IntrospectionController();
