import router from '@curveball/router';
import blob from './blob/controller';
import changePassword from './changepassword/controller';
import health from './health/controller';
import home from './home/controller';
import introspect from './introspect/controller';
import userLog from './log/controller/user';
import login from './login/controller';
import logout from './logout/controller';
import oauth2Authorize from './oauth2/controller/authorize';
import oauth2Metadata from './oauth2/controller/metadata';
import oauth2Token from './oauth2/controller/token';
import validateBearer from './oauth2/controller/validate-bearer';
import validateTotp from './oauth2/controller/validate-totp';
import register from './register/controller';
import users from './user/controller/collection';
import user from './user/controller/item';

const routes = [
  router('/', home),
  router('/user', users),
  router('/user/:id', user),
  router('/user/:id/log', userLog),
  router('/login', login),
  router('/assets/:filename', blob),
  router('/health', health),
  router('/introspect', introspect),
  router('/register', register),
  router('/authorize', oauth2Authorize),
  router('/validate-bearer', validateBearer),
  router('/validate-totp', validateTotp),
  router('/token', oauth2Token),
  router('/logout', logout),
  router('/changepassword', changePassword),
  router('/.well-known/oauth-authorization-server', oauth2Metadata),
];

export default routes;
