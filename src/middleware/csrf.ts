import { Middleware } from '@curveball/kernel';

const safeMethods = ['GET', 'OPTIONS', 'REPORT', 'HEAD', 'SEARCH', 'QUERY'];

export default function(): Middleware {

  return (ctx, next) => {

    /**
     * There's 2 ways a user might be authenticated, via a session cookie or
     * via a Authorization header with a Bearer token.
     *
     * If the user uses a session cookie, there's a CSRF risk.
     */
    if (!ctx.session.user) return next();

    if (!safeMethods.includes(ctx.method)) {
      ctx.validateCsrf();
    }

    delete ctx.request.body?.['csrf-token'];
    return next();

  };

}
