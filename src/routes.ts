import router from '@curveball/router';
import blob from './blob/controller';
import home from './home/controller';
import login from './login/controller';
import users from './user/controller/collection';
import user from './user/controller/item';
import health from './health/controller';
import oauth2Authorize from './oauth2/controller/authorize';

const routes = [
  router('/', home),
  router('/user', users),
  router('/user/:id', user),
  router('/login', login),
  router('/assets/:filename', blob),
  router('/health', health),
  router('/authorize', oauth2Authorize),
];

export default routes;
