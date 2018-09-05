import router from '@curveball/router';
import home from './home/controller';
import users from './user/controller/collection';
import user from './user/controller/item';
import login from './login/controller';
import blob from './blob/controller';

const routes = [
  router('/', home),
  router('/user', users),
  router('/user/:id', user),
  router('/login', login),
  router('/assets/:filename', blob),
];

export default routes;
