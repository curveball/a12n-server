import { Middleware } from '@curveball/core';
import { NotFound, Unauthorized } from '@curveball/http-errors';
import * as oauth2Service from './../oauth2/service.ts';
import { App, User, Principal, AppClient } from '../types.ts';
import * as privilegeService from '../privilege/service.ts';
import * as services from '../services.ts';

/**
 * Don't check or authenticate these paths.
 *
 * This is for public endpoints, or endpoints that handle auth on their own.
 */
const ignoreAuthPaths = [
  '/login',
  '/assets',
  '/health',
  '/register',
  '/authorize',
  '/authorization-challenge',
  '/token',
  '/introspect',
  '/revoke',
  '/.well-known/jwks.json',
  '/.well-known/oauth-authorization-server',
  '/.well-known/openid-configuration',

];

/**
 * List of paths that *may* support auth and provide enhanced functionality, but if
 * no auth is provided they will not block.
 */
const optionalAuthPaths = [
  '/reset-password',

]

declare module '@curveball/kernel' {

  interface Context {

    /**
     * Authentication info
     */
    auth: AuthHelper;

    privileges: privilegeService.LazyPrivilegeBox;

  }

}

class AuthHelper {

  /**
   * Currently logged in user
   */
  public principal: App | User | null;

  /**
   * The App Client that was used to authenticate the user. Note that not
   * every authentication method uses an app.
   */
  public appClient: AppClient | null;

  constructor(principal: App | User | null, appClient: AppClient | null) {
    this.principal = principal;
    this.appClient = appClient;
  }

  /**
   * Returns true if there's a logged in user (or app)
   */
  isLoggedIn(): this is { principal: App|User } {

    return this.principal !== null;

  }

  /**
   * Returns true if the logged in user matches the passsed-in principal
   */
  equals(principal: Principal): boolean {

    return this.principal?.id === principal.id;

  }

}


/**
 * The login middleware ensures that the current HTTP request is authenticated
 */
export default function(): Middleware {

  return async (ctx, next): Promise<void> => {

    let authOptional = false;

    for (const path of ignoreAuthPaths) {
      if (ctx.path === path || ctx.path.startsWith(path + '/')) {
        // Skip auth
        return next();
      }
    }
    for (const path of optionalAuthPaths) {
      if (ctx.path === path || ctx.path.startsWith(path + '/')) {
        authOptional = true;
        break;
      }
    }


    if (ctx.request.headers.has('Authorization')) {
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

      ctx.auth = new AuthHelper(
        token.principal,
        token.clientId !== 0 ? await services.appClient.findById(token.clientId) : null,
      );
      ctx.privileges = await privilegeService.get(ctx.auth.principal!);

      return next();

    }

    ctx.auth = new AuthHelper(
      ctx.session.user || null,
      null
    );
    if (ctx.auth.principal) {
      ctx.privileges = await privilegeService.get(ctx.auth.principal);
    }
    if (ctx.session.user) {
      // The user was logged in via a session cookie.
      return next();

    }

    if (authOptional) {
      // The user is not logged in, but this endpoint is optional.
      return next();
    }

    // Not logged in.
    ctx.status = 303;
    ctx.response.headers.set('Location', '/login?continue=' + encodeURIComponent(ctx.request.requestTarget));

  };

}
