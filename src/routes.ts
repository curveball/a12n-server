import router from '@curveball/router';
import staticMw from '@curveball/static';

import app from './app/controller/item.ts';
import appNew from './app/controller/new.ts';
import apps from './app/controller/collection.ts';
import changePassword from './changepassword/controller.ts';
import changePasswordRedirect from './well-known/controller/change-password.ts';
import client from './app-client/controller/item.ts';
import clientEdit from './app-client/controller/edit.ts';
import clientNew from './app-client/controller/new.ts';
import clients from './app-client/controller/collection.ts';
import group from './group/controller/item.ts';
import groupNew from './group/controller/new.ts';
import groups from './group/controller/collection.ts';
import health from './health/controller.ts';
import home from './home/controller.ts';
import introspect from './introspect/controller.ts';
import jwks from './jwks/controller.ts';
import login from './login/controller/login.ts';
import loginMfa from './login/controller/mfa.ts';
import loginWebAuthn from './mfa/webauthn/controller/login.ts';
import logout from './logout/controller.ts';
import me from './principal/controller/me.ts';
import oauth2Authorize from './oauth2/controller/authorize.ts';
import oauth2AuthorizationChallenge from './login/controller/authorization-challenge.ts';
import oauth2ErrorHandler from './oauth2/oauth2-error-handler.ts';
import oauth2Metadata from './well-known/controller/oauth2-metadata.ts';
import oauth2Revoke from './oauth2/controller/revoke.ts';
import oauth2Token from './oauth2/controller/token.ts';
import passwordToken from './reset-password/controller/token.ts';
import oidcConfiguration from './well-known/controller/openid-configuration.ts';
import oidcUserInfo from './oidc/controller/userinfo.ts';

import principalIdentityCollection from './principal-identity/controller/collection.ts';
import principalIdentityItem from './principal-identity/controller/item.ts';
import principalIdentityVerify from './principal-identity/controller/verify.ts';
import principalIdentityVerifyResponse from './principal-identity/controller/verify-response.ts';
import principalIdentityNewForm from './principal-identity/controller/new-form.ts';

import privilegeCollection from './privilege/controller/collection.ts';
import privilegeItem from './privilege/controller/item.ts';
import privilegeSearch from './privilege/controller/search.ts';
import register from './register/controller/user.ts';
import registerMfa from './register/controller/mfa.ts';
import registerTotp from './mfa/totp/controller/register.ts';
import registerWebAuthn from './mfa/webauthn/controller/register.ts';
import resetPassword from './reset-password/controller/request.ts';
import resetPasswordRedirect from './reset-password/controller/reset-password.ts';
import settings from './settings/controller.ts';
import user from './user/controller/item.ts';
import userAccessToken from './oauth2/controller/user-access-token.ts';
import userActiveSessions from './oauth2/controller/active-sessions.ts';
import userAppPermissionCollection from './user-app-permissions/controller/user-collection.ts';
import userAppPermissionItem from './user-app-permissions/controller/user-item.ts';
import userByHref from './user/controller/by-href.ts';
import userEdit from './user/controller/edit.ts';
import userEditPrivileges from './user/controller/privileges.ts';
import userLog from './log/controller/user.ts';
import userNew from './user/controller/new.ts';
import userPassword from './user/controller/password.ts';
import users from './user/controller/collection.ts';
import verificationToken from './verification-token/controller/generate.ts';
import verificationTokenExchange from './verification-token/controller/exchange.ts';
import webAuthnRegistration from './mfa/webauthn/controller/registration.ts';
import userAuthFactorCollection from './user-auth-factor/controller/collection.ts';
import totpAddToUserController from './mfa/totp/controller/add-to-user.ts';
import verifyUri from './uri-verification/controller/start.ts';
import verifyUriValidate from './uri-verification/controller/validate.ts';
import { fileURLToPath } from 'url';
import { join } from 'path';

const routes = [
  router('/', home),
  router('/assets/*filename', staticMw({staticDir: join(fileURLToPath(import.meta.url), '/../../assets')})),
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
  router('/authorization-challenge', oauth2ErrorHandler, oauth2AuthorizationChallenge),

  router('/login', login),
  router('/login/mfa', loginMfa),
  router('/login/mfa/webauthn', loginWebAuthn),
  router('/logout', logout),

  router('/me', me),
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
  router('/user/:id/identity/new', principalIdentityNewForm),
  router('/user/:id/identity/:identityId', principalIdentityItem),
  router('/user/:id/identity/:identityId/verify', principalIdentityVerify),
  router('/user/:id/identity/:identityId/verify-response', principalIdentityVerifyResponse),
  router('/user/:id/auth-factor', userAuthFactorCollection),
  router('/user/:id/auth-factor/new/totp', totpAddToUserController),

  router('/userinfo', oidcUserInfo),

  router('/change-password', changePassword),
  router('/reset-password', resetPassword),
  router('/reset-password/token/:token', passwordToken),
  router('/reset-password/change-password', resetPasswordRedirect),

  router('/verify-uri', verifyUri),
  router('/verify-uri/validate', verifyUriValidate),

  router('/.well-known/jwks.json', jwks),
  router('/.well-known/oauth-authorization-server', oauth2Metadata),
  router('/.well-known/openid-configuration', oidcConfiguration),
  router('/.well-known/change-password', changePasswordRedirect),
];

export default routes;
