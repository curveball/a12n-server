import { Middleware } from '@curveball/core';
import { NotFound, Unauthorized } from '@curveball/http-errors';
import * as oauth2Service from './../oauth2/service';

const whitelistPath = [
  '/login',
  '/assets',
  '/health',
  '/register',
  '/authorize',
  '/reset-password',
  '/token',
  '/introspect',
  '/revoke',
];


/**
 * The login middleware ensures that the current HTTP request is authenticated
 */
export default function(): Middleware {

  return async (ctx, next): Promise<void> => {

    let inWhitelist = false;
    for (const path of whitelistPath) {

      if (ctx.path === path || ctx.path.startsWith(path + '/')) {
        inWhitelist = true;
        break;
      }
    }


    if (!inWhitelist && ctx.request.headers.has('Authorization')) {
      // We had an authorization header, lets validate it
      const authHeader = ctx.request.headers.get('Authorization')!;

      const [authType, accessToken] = authHeader.split(' ');
      if (authType.toLowerCase() !== 'bearer') {
        throw new Unauthorized('Only Bearer authentication is currently supported', 'Bearer');
      }

      let token;
      try {
        token = await oauth2Service.getTokenByAccessToken(accessToken);
      } catch (e) {
        if (e instanceof NotFound) {
          throw new Unauthorized('Bearer token not recognized');
        } else {
          throw e;
        }
      }
      // We are logged in!
      ctx.state.user = token.user;

      return next();

    }

    if (ctx.state.session.user) {

      // The user was logged in via a session cookie.
      ctx.state.user = ctx.state.session.user;
      return next();

    }

    if (inWhitelist) {
      return next();
    }

    // Not logged in.
    ctx.status = 303;
    ctx.response.headers.set('Location', '/login');

  };

}
