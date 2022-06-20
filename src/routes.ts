import router from '@curveball/router';

import app from './app/controller/item';
import appNew from './app/controller/new';
import apps from './app/controller/collection';
import blob from './blob/controller';
import changePassword from './changepassword/controller';
import changePasswordRedirect from './well-known/controller/change-password';
import client from './oauth2-client/controller/item';
import clientNew from './oauth2-client/controller/new';
import clientEdit from './oauth2-client/controller/edit';
import clients from './oauth2-client/controller/collection';
import group from './group/controller/item';
import groupNew from './group/controller/new';
import groupMembers from './group/controller/member-collection';
import groups from './group/controller/collection';
import health from './health/controller';
import home from './home/controller';
import introspect from './introspect/controller';
import jwks from './jwks/controller';
import login from './login/controller/login';
import loginMfa from './login/controller/mfa';
import loginWebAuthn from './mfa/webauthn/controller/login';
import logout from './logout/controller';
import oauth2Authorize from './oauth2/controller/authorize';
import oauth2ErrorHandler from './oauth2/oauth2-error-handler';
import oauth2Metadata from './well-known/controller/oauth2-metadata';
import oauth2Revoke from './oauth2/controller/revoke';
import oauth2Token from './oauth2/controller/token';
import oneTimeToken from './one-time-token/controller/generate';
import oneTimeTokenExchange from './one-time-token/controller/exchange';
import passwordToken from './reset-password/controller/token';
import privilegeCollection from './privilege/controller/collection';
import privilegeItem from './privilege/controller/item';
import register from './register/controller/user';
import registerMfa from './register/controller/mfa';
import registerTotp from './mfa/totp/controller/register';
import registerWebAuthn from './mfa/webauthn/controller/register';
import resetPassword from './reset-password/controller/request';
import resetPasswordRedirect from './reset-password/controller/reset-password';
import settings from './settings/controller';
import user from './user/controller/item';
import userAccessToken from './oauth2/controller/user-access-token';
import userActiveSessions from './oauth2/controller/active-sessions';
import userByHref from './user/controller/by-href';
import userEdit from './user/controller/edit';
import userEditPrivileges from './user/controller/privileges';
import userLog from './log/controller/user';
import userPassword from './user/controller/password';
import userNew from './user/controller/new';
import users from './user/controller/collection';
import webAuthnRegistration from './mfa/webauthn/controller/registration';

const routes = [
  router('/', home),
  router('/assets/:filename', blob),

  router('/app', apps),
  router('/app/new', appNew),
  router('/app/:id', app),
  router('/app/:id/edit', userEdit),
  router('/app/:id/edit/privileges', userEditPrivileges),
  router('/app/:id/client', clients),
  router('/app/:id/client/new', clientNew),
  router('/app/:id/client/:clientId', client),
  router('/app/:id/client/:clientId/edit', clientEdit),

  router('/authorize', oauth2ErrorHandler, oauth2Authorize),
  router('/exchange-one-time-token', oneTimeTokenExchange),
  router('/token', oauth2ErrorHandler, oauth2Token),
  router('/revoke', oauth2Revoke),

  router('/login', login),
  router('/login/mfa', loginMfa),
  router('/login/mfa/webauthn', loginWebAuthn),
  router('/logout', logout),

  router('/health', health),
  router('/introspect', introspect),

  router('/group', groups),
  router('/group/new', groupNew),
  router('/group/:id', group),
  router('/group/:id/edit', userEdit),
  router('/group/:id/edit/privileges', userEditPrivileges),
  router('/group/:id/member', groupMembers),

  router('/privilege', privilegeCollection),
  router('/privilege/:id', privilegeItem),

  router('/register', register),
  router('/register/mfa', registerMfa),
  router('/register/mfa/totp', registerTotp),
  router('/register/mfa/webauthn', registerWebAuthn),
  router('/register/mfa/webauthn/registration', webAuthnRegistration),

  router('/settings', settings),

  router('/user', users),
  router('/user/byhref/:href', userByHref),
  router('/user/new', userNew),
  router('/user/:id', user),
  router('/user/:id/edit', userEdit),
  router('/user/:id/edit/privileges', userEditPrivileges),
  router('/user/:id/log', userLog),
  router('/user/:id/password', userPassword),
  router('/user/:id/one-time-token', oneTimeToken),
  router('/user/:id/access-token', userAccessToken),
  router('/user/:id/sessions', userActiveSessions),

  router('/change-password', changePassword),
  router('/reset-password', resetPassword),
  router('/reset-password/token/:token', passwordToken),
  router('/reset-password/change-password', resetPasswordRedirect),

  router('/.well-known/jwks.json', jwks),
  router('/.well-known/oauth-authorization-server', oauth2Metadata),
  router('/.well-known/change-password', changePasswordRedirect),
];

export default routes;
