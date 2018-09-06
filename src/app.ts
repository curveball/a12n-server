import bodyParser from '@curveball/bodyparser';
import { Application } from '@curveball/core';
import halBrowser from 'hal-browser';
import process from 'process';
import routes from './routes';
import session from '@curveball/session';
import login from './middleware/login';

const app = new Application();

app.use( async (ctx, next) => {
  console.log('=> %s %s', ctx.request.method, ctx.request.path);
  await next();
  console.log('<= %s', ctx.response.status);
});

app.use( async (ctx, next) => {

  try {
    await next();
  } catch (e) {
    console.log(e);
    throw e;
  }

});

app.use(session({
  store: 'memory'
}));

app.use(halBrowser({
  title: 'Auth API',
}));

app.use(login());

app.use((ctx, next) => {
  return bodyParser()(ctx, next);
});

for (const route of routes) {
  app.use(route);
}

app.listen(parseInt(process.env.PORT, 10));
console.log('Listening on port', process.env.PORT);
