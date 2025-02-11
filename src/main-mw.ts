import bodyParser from '@curveball/bodyparser';
import browser from '@curveball/browser';
import cors from '@curveball/cors';
import links from '@curveball/links';
import problem from '@curveball/problem';
import session from '@curveball/session';
import validator from '@curveball/validator';
import { invokeMiddlewares, Middleware } from '@curveball/core';

import login from './middleware/login.ts';
import csrf from './middleware/csrf.ts';
import routes from './routes.ts';
import { getSetting } from './server-settings.ts';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as services from './services.ts';

/**
 * The 'main middleware'.
 *
 * Most of the application is expressed as a single middleware. This could
 * potentially allow a12nserver to be embedded in another curveball
 * application.
 */
export default function (): Middleware {

  if (process.env.PUBLIC_URI === undefined) {
    throw new Error('PUBLIC_URI environment variable must be set.');
  }

  const middlewares: Middleware[] = [];

  const corsAllowOrigin = getSetting('cors.allowOrigin');

  if (corsAllowOrigin) {
    middlewares.push(cors({
      allowOrigin: corsAllowOrigin
    }));
  }

  middlewares.push(
    session({
      store: services.kv.getSessionStore(),
      cookieName: 'A12N',
      expiry: 60 * 60 * 24 * 7,
    }),
    browser({
      title: process.env.APP_NAME || 'a12n-server',
      stylesheets: [
        '/assets/extra.css'
      ],
    }),
    problem(),

    login(),
    bodyParser(),
    csrf(),
    links(),
    validator({
      schemaPath: dirname(fileURLToPath(import.meta.url)) + '/../schemas',
      noLink: true,
    }),
    ...routes,
  );

  /**
   * This middleware contains all the a12n-server functionality.
   */
  return (ctx, next) => {
    return invokeMiddlewares(ctx, [...middlewares, next]);
  };

}
