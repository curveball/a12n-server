import { OAuth2Token } from '../types';

export function metadata() {

  return <any> {
    issuer: '/',
    authorization_endpoint: '/authorize',
    token_endpoint: '/token',
    response_types_supported: ['token', 'code'],
    grant_types_supported: ['client_credentials', 'implicit', 'authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['client_secret_basic'],
    service_documentation: 'https://evertpot.com/',
    ui_locales_supported: ['en'],
    introspection_endpoint: '/introspect',
    revocation_endpoint: '/revoke',
    revocation_endpoint_auth_methods_supported: ['client_secret_basic'],
  };

}


export function tokenResponse(token: OAuth2Token | Omit<OAuth2Token, 'clientId'>) {
  return {
    access_token: token.accessToken,
    token_type: token.tokenType,
    expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
    refresh_token: token.refreshToken,
  };
}
