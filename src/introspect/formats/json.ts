import { OAuth2Token } from '../../oauth2/types';
import { PrivilegeMap } from '../../privilege/types';
import * as url from 'url';

export function accessToken(origin: string, token: OAuth2Token, privileges: PrivilegeMap) {

  return {
    active: true,
    scope: Object.values(privileges).join(' '),
    privileges: privileges,
    client_id: token.clientId,
    username: token.principal.nickname,
    token_type: 'bearer',
    exp: token.accessTokenExpires,
    sub: url.resolve(origin, token.principal.href),
    _links: {
      'authenticated-as': {
        href: url.resolve(origin, token.principal.href),
      }
    }
  };

}

export function refreshToken(origin: string, token: OAuth2Token, privileges: PrivilegeMap) {

  return {
    active: true,
    scope: Object.values(privileges).join(' '),
    privileges: privileges,
    client_id: token.clientId,
    username: token.principal.nickname,
    token_type: 'refresh_token',
    sub: url.resolve(origin, token.principal.href),
    _links: {
      'authenticated-as': {
        href: url.resolve(origin, token.principal.href),
      }
    }
  };

}

export function inactive() {

  return {
    active: false
  };

}
