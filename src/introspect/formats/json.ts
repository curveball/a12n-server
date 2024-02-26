import { OAuth2Token } from '../../oauth2/types';
import { PrivilegeMap } from '../../privilege/types';
import * as url from 'url';
import { OAuth2Client } from '../../types';

type IntrospectInfo = {
  privileges: PrivilegeMap;
  client: OAuth2Client;
  token: OAuth2Token;
  tokenType: 'bearer' | 'refresh_token';
  origin: string;
}


/**
 * Defined in:
 *
 * https://www.rfc-editor.org/rfc/rfc7662#section-2.2
 */
type IntrospectResponse = {
  active: boolean;
  scope?: string;
  client_id?: string;
  username?: string;
  token_type?: 'bearer' | 'refresh_token';
  exp?: number;
  iat?: number;
  nbf?: number;
  sub?: string;
  aud?: string;
  iss?: string;
  jti?: string;

  /**
   * A12n additions.
   */
  privileges: PrivilegeMap;
  _links: {
    'authenticated-as': {
      href: string;
    };
  };

}


export function introspectResponse(info: IntrospectInfo): IntrospectResponse {

  // Currently we determine the 'scope' by taking all privileges for each
  // resource. In the future this will be refined.
  const scope = new Set<string>();

  for(const privilegeSet of Object.values(info.privileges)) {
    for(const privilege of privilegeSet) scope.add(privilege);
  }

  return {
    active: true,
    scope: (Array.from(scope.values())).join(' '),
    privileges: info.privileges,
    client_id: info.client.clientId,
    username: info.token.principal.nickname,
    token_type: info.tokenType,
    exp: info.tokenType === 'refresh_token' ? info.token.refreshTokenExpires : info.token.accessTokenExpires,
    sub: url.resolve(info.origin, info.token.principal.href),
    aud: url.resolve(info.origin, info.client.app.href),
    iss: info.origin,
    _links: {
      'authenticated-as': {
        href: url.resolve(info.origin, info.token.principal.href),
      }
    }
  };

}

export function inactive() {

  return {
    active: false
  };

}
