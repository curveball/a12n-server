import { OAuth2Token } from '../types';
import { resolve } from 'url';
import { getGlobalOrigin } from '@curveball/kernel';

export function metadata() {

  return {
    issuer: getGlobalOrigin(),
    authorization_endpoint: '/authorize',

    token_endpoint: '/token',
    token_endpoint_auth_methods_supported: ['client_secret_basic'],
    token_endpoint_auth_signing_alg_values_supported: ['RS256'],

    jwks_uri: resolve(getGlobalOrigin(), '/.well-known/jwks.json'),

    scopes_supported: ['openid'],

    response_types_supported: ['token', 'code', 'code id_token'],
    grant_types_supported: ['client_credentials', 'implicit', 'authorization_code', 'refresh_token'],
    id_token_signing_alg_values_supported: ['RS256'],

    service_documentation: getGlobalOrigin(),
    ui_locales_supported: ['en'],
    introspection_endpoint: '/introspect',
    revocation_endpoint: '/revoke',
    revocation_endpoint_auth_methods_supported: ['client_secret_basic'],
  };

}
export function tokenResponse(token: OAuth2Token) {
  return {
    access_token: token.accessToken,
    token_type: token.tokenType,
    expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
    refresh_token: token.refreshToken,
    id_token: token.idToken,
  };
}
