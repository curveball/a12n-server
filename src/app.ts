import { Application } from '@curveball/core';

import process from 'process';
import mainMw from './main-mw';

const app = new Application();

app.use( async (ctx, next) => {
  console.log('=> %s %s', ctx.request.method, ctx.request.path);
  await next();
  console.log('<= %s', ctx.response.status);
});

app.use(mainMw());

app.listen(parseInt(process.env.PORT, 10));
console.log('Listening on port', process.env.PORT);
