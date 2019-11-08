// tslint:disable no-console
import { Application } from '@curveball/core';

import process from 'process';
import mainMw from './main-mw';
import { load } from './server-settings';

(async () => {

  const pkgInfo = require('../package.json');
  console.log('%s %s', pkgInfo.name, pkgInfo.version);

  console.log('Connecting to database');
  console.log('Loading settings');
  await load();

  const app = new Application();

  app.use( async (ctx, next) => {
    console.log('=> %s %s', ctx.request.method, ctx.request.path);
    await next();
    console.log('<= %s', ctx.response.status);
  });

  app.use(mainMw());

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) :  8531;

  if (!process.env.PUBLIC_URI) {
    process.env.PUBLIC_URI = 'http://localhost:' + port + '/';
    console.log('PUBLIC_URI environment variable was not set, defaulting to http://localhost:' + port + '/')
  }

  app.listen(port);

  console.log('Listening on port', port);


})();
