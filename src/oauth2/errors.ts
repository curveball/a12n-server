import { Context } from '@curveball/core';
import { HttpError } from '@curveball/http-errors';

interface OAuthError extends HttpError {
  errorCode: string;
}

export function serializeError(ctx: Context, err: OAuthError) {

  ctx.response.status = err.httpCode;
  ctx.response.headers.set('Content-Type', 'application/json');
  ctx.response.body = {
    error: err.errorCode,
    error_description: err.message,
  };

}

export class InvalidRequest extends Error implements OAuthError {

  httpCode = 400;
  errorCode = 'invalid_request';

}

export class UnsupportedGrantType extends Error implements OAuthError {

  httpCode = 400;
  errorCode = 'unsupported_grant_type';

}

export class UnauthorizedClient extends Error implements OAuthError {

  httpCode = 400;
  errorCode = 'unauthorized_client';

}
