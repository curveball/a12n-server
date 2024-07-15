import router from '@curveball/router';

import app from './app/controller/item.js';
import appNew from './app/controller/new.js';
import apps from './app/controller/collection.js';
import blob from './blob/controller.js';
import changePassword from './changepassword/controller.js';
import changePasswordRedirect from './well-known/controller/change-password.js';
import client from './oauth2-client/controller/item.js';
import clientEdit from './oauth2-client/controller/edit.js';
import clientNew from './oauth2-client/controller/new.js';
import clients from './oauth2-client/controller/collection.js';
import group from './group/controller/item.js';
import groupNew from './group/controller/new.js';
import groups from './group/controller/collection.js';
import health from './health/controller.js';
import home from './home/controller.js';
import introspect from './introspect/controller.js';
import jwks from './jwks/controller.js';
import login from './login/controller/login.js';
import loginMfa from './login/controller/mfa.js';
import loginWebAuthn from './mfa/webauthn/controller/login.js';
import logout from './logout/controller.js';
import oauth2Authorize from './oauth2/controller/authorize.js';
import oauth2ErrorHandler from './oauth2/oauth2-error-handler.js';
import oauth2Metadata from './well-known/controller/oauth2-metadata.js';
import oauth2Revoke from './oauth2/controller/revoke.js';
import oauth2Token from './oauth2/controller/token.js';
import passwordToken from './reset-password/controller/token.js';
import principalIdentityCollection from './principal-identity/controller/collection.js';
import principalIdentityItem from './principal-identity/controller/item.js';
import privilegeCollection from './privilege/controller/collection.js';
import privilegeItem from './privilege/controller/item.js';
import privilegeSearch from './privilege/controller/search.js';
import register from './register/controller/user.js';
import registerMfa from './register/controller/mfa.js';
import registerTotp from './mfa/totp/controller/register.js';
import registerWebAuthn from './mfa/webauthn/controller/register.js';
import resetPassword from './reset-password/controller/request.js';
import resetPasswordRedirect from './reset-password/controller/reset-password.js';
import settings from './settings/controller.js';
import user from './user/controller/item.js';
import userAccessToken from './oauth2/controller/user-access-token.js';
import userActiveSessions from './oauth2/controller/active-sessions.js';
import userAppPermissionCollection from './user-app-permissions/controller/user-collection.js';
import userAppPermissionItem from './user-app-permissions/controller/user-item.js';
import userByHref from './user/controller/by-href.js';
import userEdit from './user/controller/edit.js';
import userEditPrivileges from './user/controller/privileges.js';
import userLog from './log/controller/user.js';
import userNew from './user/controller/new.js';
import userPassword from './user/controller/password.js';
import users from './user/controller/collection.js';
import verificationToken from './verification-token/controller/generate.js';
import verificationTokenExchange from './verification-token/controller/exchange.js';
import webAuthnRegistration from './mfa/webauthn/controller/registration.js';

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
  router('/app/:id/identity', principalIdentityCollection),
  router('/app/:id/identity/:identityId', principalIdentityItem),

  router('/authorize', oauth2ErrorHandler, oauth2Authorize),
  router('/exchange-one-time-token', verificationTokenExchange),
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

  router('/privilege', privilegeCollection),
  router('/privilege/:id', privilegeItem),
  router('/privilege-search', privilegeSearch),

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
  router('/user/:id/one-time-token', verificationToken),
  router('/user/:id/access-token', userAccessToken),
  router('/user/:id/sessions', userActiveSessions),
  router('/user/:id/app-permission', userAppPermissionCollection),
  router('/user/:id/app-permission/:appId', userAppPermissionItem),
  router('/user/:id/identity', principalIdentityCollection),
  router('/user/:id/identity/:identityId', principalIdentityItem),

  router('/change-password', changePassword),
  router('/reset-password', resetPassword),
  router('/reset-password/token/:token', passwordToken),
  router('/reset-password/change-password', resetPasswordRedirect),

  router('/.well-known/jwks.json', jwks),
  router('/.well-known/oauth-authorization-server', oauth2Metadata),
  router('/.well-known/change-password', changePasswordRedirect),
];

export default routes;
