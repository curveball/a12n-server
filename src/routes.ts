import router from '@curveball/router';
import blob from './blob/controller';
import home from './home/controller';
import login from './login/controller';
import users from './user/controller/collection';
import user from './user/controller/item';

const routes = [
  router('/', home),
  router('/user', users),
  router('/user/:id', user),
  router('/login', login),
  router('/assets/:filename', blob),
];

export default routes;
