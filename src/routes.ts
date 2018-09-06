import router from '@curveball/router';
import blob from './blob/controller';
import home from './home/controller';
import login from './login/controller';
import users from './user/controller/collection';
import user from './user/controller/item';
import health from './health/controller';

const routes = [
  router('/', home),
  router('/user', users),
  router('/user/:id', user),
  router('/login', login),
  router('/assets/:filename', blob),
  router('/health', health),
];

export default routes;
