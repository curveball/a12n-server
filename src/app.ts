// tslint:disable no-console
import { Application } from '@curveball/core';

import process from 'process';
import mainMw from './main-mw';
import accessLog from '@curveball/accesslog';

import { load } from './server-settings';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkgInfo = require('../package.json');
console.log('⚾ Curveball %s %s', pkgInfo.name, pkgInfo.version);

require('dotenv').config();
require('dotenv-defaults').config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) :  8531;
if (!process.env.PUBLIC_URI) {
  process.env.PUBLIC_URI = 'http://localhost:' + port + '/';
  console.log('PUBLIC_URI environment variable was not set, defaulting to http://localhost:' + port + '/');
}

(async () => {


  console.log('Connecting to database');
  console.log('Loading settings');
  await load();

  const app = new Application();

  app.use(accessLog());
  app.use(mainMw());

  app.listen(port);

  console.log('Listening on port', port);


})().catch( (err) => {

  console.error('Could not start a12n-server');
  console.error(err);
  process.exit(2);

});
