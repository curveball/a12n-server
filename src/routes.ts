import router from '@curveball/router';
import home from './home/controller';

const routes = [
  router('/', home),
];

export default routes;
