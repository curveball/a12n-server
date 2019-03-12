import { Application } from '@curveball/core';

import process from 'process';
import mainMw from './main-mw';

const app = new Application();

app.use( async (ctx, next) => {
  // tslint:disable-next-line:no-console
  console.log('=> %s %s', ctx.request.method, ctx.request.path);
  await next();
  // tslint:disable-next-line:no-console
  console.log('<= %s', ctx.response.status);
});

app.use(mainMw());

const port = process.env.PORT ? parseInt(process.env.PORT, 10) :  8531;

app.listen(port);

// tslint:disable-next-line:no-console
console.log('Listening on port', port);
