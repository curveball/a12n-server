import { Context } from '@curveball/core';
import{ User } from '../types.ts';

export function isValidRedirect(url: string): boolean {
  return url.startsWith('/');
}

export function setLoginSession(ctx: Context, user: User) {

  ctx.session = {
    user,
    loginTime: new Date().getTime(),
  };

}
