import bodyParser from '@curveball/bodyparser';
import { invokeMiddlewares, Middleware } from '@curveball/core';
import problem from '@curveball/problem';
import session from '@curveball/session';
import browser from '@curveball/browser';
import login from './middleware/login';
import routes from './routes';

export default function(): Middleware {

  if (process.env.PUBLIC_URI === undefined) {
    throw new Error('PUBLIC_URI environment variable must be set.');
  }

  const middlewares = [
    browser({
      title: 'a12n-server',
    }),
    problem(),
    session({
      store: 'memory',
      cookieName: 'A12N',
      expiry: 60*60*24*7,
    }),
    login(),
    bodyParser(),
    ...routes,
  ];

  /**
   * This middleware contains all the a12n-server functionality.
   */
  return ctx => {
    return invokeMiddlewares(ctx, middlewares);
  };

}
