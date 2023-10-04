import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { UnprocessableEntity, UnsupportedMediaType } from '@curveball/http-errors';
import { NotFound } from '@curveball/http-errors';
import * as oauth2Service from '../oauth2/service';
import { OAuth2Token } from '../oauth2/types';
import * as privilegeService from '../privilege/service';
import { accessToken, inactive, refreshToken } from './formats/json';

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
      throw new UnprocessableEntity('The "token" parameter must be set');
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

      switch (foundTokenType!) {

        case 'accessToken' :
          ctx.response.body = accessToken(foundToken, privileges);
          break;
        case 'refreshToken' :
          ctx.response.body = refreshToken(foundToken, privileges);
          break;
      }
      return;
    }

    ctx.response.body = inactive();

  }

}

export default new IntrospectionController();
