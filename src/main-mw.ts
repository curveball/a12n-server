import bodyParser from '@curveball/bodyparser';
import { invokeMiddlewares, Middleware } from '@curveball/core';
import problem from '@curveball/problem';
import session from '@curveball/session';
import halBrowser from 'hal-browser';
import login from './middleware/login';
import routes from './routes';

export default function(): Middleware {

  if (process.env.PUBLIC_URI === undefined) {
    throw new Error('A PUBLIC_URI environment variable');
  }

  const middlewares = [
    halBrowser({
      title: 'a12n-server',
    }),
    problem(),
    session({
      store: 'memory',
    }),
    login(),
    bodyParser(),
    ...routes,
  ];

  /**
   * This middleware contains all the a12n-server functionality.
   */
  return (ctx, next) => {
    return invokeMiddlewares(ctx, middlewares);
  };

}
