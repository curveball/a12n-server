import router from '@curveball/router';
import blob from './blob/controller';
import health from './health/controller';
import home from './home/controller';
import login from './login/controller';
import oauth2Authorize from './oauth2/controller/authorize';
import oauth2Token from './oauth2/controller/token';
import validateBearer from './oauth2/controller/validate-bearer';
import validateTotp from './oauth2/controller/validate-totp';
import users from './user/controller/collection';
import user from './user/controller/item';
import logout from './logout/controller';

const routes = [
  router('/', home),
  router('/user', users),
  router('/user/:id', user),
  router('/login', login),
  router('/assets/:filename', blob),
  router('/health', health),
  router('/authorize', oauth2Authorize),
  router('/validate-bearer', validateBearer),
  router('/validate-totp', validateTotp),
  router('/token', oauth2Token),
  router('/logout', logout),
];

export default routes;
