/* eslint no-console: 0 */
import { Application } from '@curveball/core';

import mainMw from './main-mw';
import accessLog from '@curveball/accesslog';

import { init as initDb } from './database';
import { load } from './server-settings';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkgInfo = require('../package.json');
console.info('⚾ %s %s', pkgInfo.name, pkgInfo.version);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) :  8531;
if (!process.env.PUBLIC_URI) {
  process.env.PUBLIC_URI = 'http://localhost:' + port + '/';
  console.log('PUBLIC_URI environment variable was not set, defaulting to http://localhost:' + port + '/');
}

(async () => {

  await initDb();

  await load();

  const app = new Application();

  app.use(accessLog({
    blacklist: [],
  }));
  app.use(mainMw());

  app.listen(port);
  console.log('Running on \x1b[31m%s\x1b[0m', app.origin + '/');

})().catch( (err) => {

  console.error('Could not start a12n-server');
  console.error(err);
  process.exit(2);

});
