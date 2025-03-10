import { HttpError } from '@curveball/http-errors';

export abstract class OAuth2Error extends Error implements HttpError {
  abstract errorCode: string;
  abstract httpStatus: number;

  /**
   * Returns the JSON response body for the OAuth2 error.
   */
  serializeErrorBody() {

    return {
      error: this.errorCode,
      error_description: this.message,
    };

  }

}

export function isOAuth2Error(err: any): err is OAuth2Error {

  return typeof (err as any).errorCode === 'string';

}

/**
 * The request is missing a required parameter, includes an invalid parameter
 * value, includes a parameter more than once or is otherwise malformed.
 */
export class InvalidRequest extends OAuth2Error {

  httpStatus = 400;
  errorCode = 'invalid_request';

}

/**
 * The client is not authorized to request an authorization code using this
 * method
 */
export class UnauthorizedClient extends OAuth2Error {

  httpStatus = 403;
  errorCode = 'unauthorized_client';

}

/**
 * The resource owner or authorization server denied the request
 */
export class AccessDenied extends OAuth2Error {

  httpStatus = 403;
  errorCode = 'access_denied';

}

/**
 * The authorization server does not support obtaining an authorization code
 * using this method
 */
export class UnsupportedResponseType extends OAuth2Error {

  httpStatus = 400;
  errorCode = 'unsupported_response_type';

}

/**
 * The requested scope is invalid, unknown or malformed
 */
export class InvalidScope extends OAuth2Error {

  httpStatus = 400;
  errorCode = 'invalid_scope';

}

/**
 * Client authentication failed (e.g., unknown client, no client authentication
 * included, or unsupported authentication method).  The authorization server
 * MAY return an HTTP 401 (Unauthorized) status code to indicate which HTTP
 * authentication schemes are supported.  If the client attempted to
 * authenticate via the "Authorization" request header field, the authorization
 * server MUST respond with an HTTP 401 (Unauthorized) status code and include
 * the "WWW-Authenticate" response header field matching the authentication
 * scheme used by the client.
 */
export class InvalidClient extends OAuth2Error {

  httpStatus = 401;
  errorCode = 'invalid_client';

}

/**
 * The provided authorization grant (e.g., authorization code, resource owner
 * credentials) or refresh token is invalid, expired, revoked, does not match
 * the redirection URI used in the authorization request, or was issued to
 * another client.
 */
export class InvalidGrant extends OAuth2Error {

  httpStatus = 400;
  errorCode = 'invalid_grant';

}

/**
 * The authorization grant type is not supported by the authorization server.
 */
export class UnsupportedGrantType extends OAuth2Error {

  httpStatus = 400;
  errorCode = 'unsupported_grant_type';

}

/**
 * The authorization server encountered an unexpected condition that prevented
 * it from fulfilling the request. (This error code is needed because a 500
 * Internal Server Error HTTP status code cannot be returned to the client via
 * an HTTP redirect.)
 */
export class ServerError extends OAuth2Error {

  httpStatus = 500;
  errorCode = 'server_error';

}

/**
 * The authorization server is currently unable to handle the request due to a
 * temporary overloading or maintenance of the server.  (This error code is
 * needed because a 503 Service Unavailable HTTP status code cannot be returned
 * to the client via an HTTP redirect.)
 */
export class TemporarilyUnavailable extends OAuth2Error {

  httpStatus = 503;
  errorCode = 'temporarily_unavailable';

}

/**
 * OpenID Connect specific error code.
 *
 * This is emitted when the client initiated an authorization_code flow with prompt=none,
 * but the user was not logged in.
 */
export class LoginRequired extends OAuth2Error {

  httpStatus = 400;
  errorCode = 'login_required';

}
