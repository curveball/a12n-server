import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { UnsupportedMediaType, UnprocessableEntity } from '@curveball/http-errors';
import * as oauth2Service from '../oauth2/service';
import { NotFound } from '@curveball/http-errors';
import { accessToken, refreshToken, inactive } from './formats/json';

class IntrospectionController extends Controller {

  async post(ctx: Context) {

    if (!ctx.request.is('application/x-www-form-urlencoded')) {
      throw new UnsupportedMediaType('This endpoint only supports application/x-www-form-urlencoded');
    }

    if (!('token' in ctx.request.body)) {
      throw new UnprocessableEntity('The "token" parameter must be set');
    }

    const token = ctx.request.body.token;
    const tokenTypeHint = ctx.request.body.token_type_hint || null;

    ctx.response.type = 'application/json';
    if (tokenTypeHint === null || tokenTypeHint === 'access_token') {

      try {

        ctx.response.body = accessToken(await oauth2Service.getTokenByAccessToken(token));
        return;

      } catch (err) {

        if (!(err instanceof NotFound)) {
          // Rethrowing everything except 'not found'
          throw err;
        }

      }

    }
    if (tokenTypeHint === null || tokenTypeHint === 'refresh_token') {

      try {

        ctx.response.body = refreshToken(await oauth2Service.getTokenByRefreshToken(token));
        return;

      } catch (err) {

        if (!(err instanceof NotFound)) {
          // Rethrowing everything except 'not found'
          throw err;
        }

      }

    }

    ctx.response.body = inactive();

  }

}

export default new IntrospectionController();
