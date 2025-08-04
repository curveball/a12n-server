import { Context } from '@curveball/core';
import { User } from '../types.ts';

export function isValidRedirect(url: string): boolean {
  return url.startsWith('/');
}

export function setLoginSession(ctx: Context, user: User) {

  ctx.session = {
    user,
    loginTime: new Date().getTime(),
  };

}

/**
 * Clears the session by:
 *  - clearing the session object.
 *  - clearing the session id.
 *  - setting the a12n cookie to an expired date.
 * @param ctx - The context object.
 */
export function clearSession(ctx: Context) {
  ctx.session = {};
  ctx.sessionId = null;
  ctx.response.headers.set('Set-Cookie', `a12n=;Expires=${new Date(0).toUTCString()}; HttpOnly=true; Max-Age=0`);
}
