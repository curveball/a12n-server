/* eslint no-console: 0 */
import { Application } from '@curveball/core';
import accessLog from '@curveball/accesslog';

import mainMw from './main-mw.js';
import { init as initDb } from './database.js';
import { load } from './server-settings.js';

import { NAME, VERSION } from './version.js';

import * as dotenv from 'dotenv';

dotenv.config();

console.info('⚾ %s %s', NAME, VERSION);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) :  8531;

if (!process.env.PUBLIC_URI) {
  process.env.PUBLIC_URI = 'http://localhost:' + port + '/';
  console.log('PUBLIC_URI environment variable was not set, defaulting to http://localhost:' + port + '/');
}

(async () => {

  process.title = 'a12n-server/' + VERSION;

  await initDb();
  await load();

  const app = new Application();

  app.use(accessLog({
    blacklist: [],
  }));
  app.use(mainMw());

  const httpServer = app.listen(port);
  if (process.env.KEEP_ALIVE_TIMEOUT_MS) {
    httpServer.keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT_MS, 10);
  }

  console.log('Running on \x1b[31m%s\x1b[0m', app.origin + '/');

})().catch( (err) => {

  console.error('Could not start a12n-server');
  console.error(err);
  process.exit(2);

});
