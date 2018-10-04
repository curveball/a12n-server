import bodyParser from '@curveball/bodyparser';
import { Application } from '@curveball/core';
import session from '@curveball/session';
import halBrowser from 'hal-browser';
import process from 'process';
import login from './middleware/login';
import problem from './middleware/problem';
import routes from './routes';

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
    console.error(e);
    throw e;
  }

});

app.use(halBrowser({
  title: 'Auth API',
}));

app.use(problem());

app.use(session({
  store: 'memory'
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
