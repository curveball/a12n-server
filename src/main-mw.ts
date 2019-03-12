import bodyParser from '@curveball/bodyparser';
import { invokeMiddlewares, Middleware } from '@curveball/core';
import session from '@curveball/session';
import halBrowser from 'hal-browser';
import login from './middleware/login';
import problem from './middleware/problem';
import routes from './routes';

export default function(): Middleware {

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
