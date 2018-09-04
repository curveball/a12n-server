import router from '@curveball/router';
import home from './home/controller';
import users from './user/controller/collection';
import user from './user/controller/item';

const routes = [
  router('/', home),
  router('/user', users),
  router('/user/:id', user),
];

export default routes;
