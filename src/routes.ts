import router from '@curveball/router';
import blob from './blob/controller';
import changePassword from './changepassword/controller';
import createUser from './create-user/controller';
import group from './group/controller/collection';
import health from './health/controller';
import home from './home/controller';
import introspect from './introspect/controller';
import userLog from './log/controller/user';
import login from './login/controller';
import logout from './logout/controller';
import oauth2Authorize from './oauth2/controller/authorize';
import oauth2Token from './oauth2/controller/token';
import privilegeCollection from './privilege/controller/collection';
import privilegeItem from './privilege/controller/item';
import validateBearer from './oauth2/controller/validate-bearer';
import validateTotp from './oauth2/controller/validate-totp';
import register from './register/controller';
import resetPassword from './reset-password/controller/request';
import resetPasswordRedirect from './reset-password/controller/reset-password';
import passwordToken from './reset-password/controller/token';
import users from './user/controller/collection';
import user from './user/controller/item';
import changePasswordRedirect from './well-known/controller/change-password';
import oauth2Metadata from './well-known/controller/oauth2-metadata';

const routes = [
  router('/', home),
  router('/assets/:filename', blob),

  router('/authorize', oauth2Authorize),
  router('/token', oauth2Token),


  router('/create-user', createUser),

  router('/login', login),
  router('/logout', logout),

  router('/health', health),
  router('/introspect', introspect),

  router('/privilege', privilegeCollection),
  router('/privilege/:id', privilegeItem),

  router('/register', register),

  router('/user', users),
  router('/user/:id', user),
  router('/user/:id/log', userLog),
  router('/user/:id/member', group),

  router('/changepassword', changePassword),
  router('/reset-password', resetPassword),
  router('/reset-password/token/:token', passwordToken),
  router('/reset-password/change-password', resetPasswordRedirect),

  router('/validate-bearer', validateBearer),
  router('/validate-totp', validateTotp),

  router('/.well-known/oauth-authorization-server', oauth2Metadata),
  router('/.well-known/change-password', changePasswordRedirect),
];

export default routes;
