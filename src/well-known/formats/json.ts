import { resolve } from 'url';
import { getGlobalOrigin } from '@curveball/kernel';

type AuthMethod = 'client_secret_basic';
type SigningAlgs = 'RS256';

type GrantType = 'client_credentials' | 'implicit' | 'authorization_code' | 'refresh_token';

type ResponseType = 'token' | 'code' | 'code id_token';
type ResponseMode = 'query' | 'fragment';

type MetaData = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;

  token_endpoint_auth_methods_supported: AuthMethod[];
  token_endpoint_auth_signing_alg_values_supported: SigningAlgs[];

  jwks_uri: string;
  scopes_supported: string[];

  response_types_supported: ResponseType[];
  response_modes_supported: ResponseMode[];
  grant_types_supported: GrantType[];

  id_token_signing_alg_values_supported: SigningAlgs[];

  service_documentation: string;
  ui_locales_supported: string[];

  introspection_endpoint: string;
  revocation_endpoint: string;
  revocation_endpoint_auth_methods_supported: AuthMethod[];

  // https://www.ietf.org/archive/id/draft-parecki-oauth-first-party-apps-00.html
  authorization_challenge_endpoint: string;

}

export function metadata(): MetaData {

  return {
    issuer: getGlobalOrigin(),
    authorization_endpoint: '/authorize',

    token_endpoint: '/token',
    token_endpoint_auth_methods_supported: ['client_secret_basic'],
    token_endpoint_auth_signing_alg_values_supported: ['RS256'],

    jwks_uri: resolve(getGlobalOrigin(), '/.well-known/jwks.json'),

    scopes_supported: ['openid'],

    response_types_supported: ['token', 'code', 'code id_token'],
    response_modes_supported: ['fragment', 'query'],
    grant_types_supported: ['client_credentials', 'implicit', 'authorization_code', 'refresh_token'],
    id_token_signing_alg_values_supported: ['RS256'],

    service_documentation: getGlobalOrigin(),
    ui_locales_supported: ['en'],
    introspection_endpoint: '/introspect',
    revocation_endpoint: '/revoke',
    revocation_endpoint_auth_methods_supported: ['client_secret_basic'],

    authorization_challenge_endpoint: '/authorization-challenge',

  };

}
