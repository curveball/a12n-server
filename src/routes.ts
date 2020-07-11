import router from '@curveball/router';
import blob from './blob/controller';
import changePassword from './changepassword/controller';
import createUser from './create-user/controller';
import group from './group/controller/collection';
import health from './health/controller';
import home from './home/controller';
import introspect from './introspect/controller';
import userLog from './log/controller/user';
import login from './login/controller/login';
import loginMfa from './login/controller/mfa';
import loginWebAuthn from './mfa/webauthn/controller/login';
import logout from './logout/controller';
import oauth2Authorize from './oauth2/controller/authorize';
import oauth2Token from './oauth2/controller/token';
import privilegeCollection from './privilege/controller/collection';
import privilegeItem from './privilege/controller/item';
import register from './register/controller/user';
import registerMfa from './register/controller/mfa';
import registerWebAuthn from './register/controller/webauthn';
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
  router('/mfa', loginMfa),
  router('/login/mfa/webauthn', loginWebAuthn),
  router('/logout', logout),

  router('/health', health),
  router('/introspect', introspect),

  router('/privilege', privilegeCollection),
  router('/privilege/:id', privilegeItem),

  router('/register', register),
  router('/register/mfa', registerMfa),
  router('/register/mfa/webauthn', registerWebAuthn),

  router('/user', users),
  router('/user/:id', user),
  router('/user/:id/log', userLog),
  router('/user/:id/member', group),

  router('/changepassword', changePassword),
  router('/reset-password', resetPassword),
  router('/reset-password/token/:token', passwordToken),
  router('/reset-password/change-password', resetPasswordRedirect),

  router('/.well-known/oauth-authorization-server', oauth2Metadata),
  router('/.well-known/change-password', changePasswordRedirect),
];

export default routes;
