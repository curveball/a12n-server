import { OAuth2Token } from '../../oauth2/types';
import { PrivilegeMap } from '../../privilege/types';
import * as url from 'url';

export function accessToken(token: OAuth2Token, privileges: PrivilegeMap) {

  return {
    active: true,
    scope: Object.values(privileges).join(' '),
    privileges: privileges,
    client_id: token.clientId,
    username: token.principal.nickname,
    token_type: 'bearer',
    exp: token.accessTokenExpires,
    _links: {
      'authenticated-as': {
        href: url.resolve(process.env.PUBLIC_URI!, token.principal.href),
      }
    }
  };

}

export function refreshToken(token: OAuth2Token, privileges: PrivilegeMap) {

  return {
    active: true,
    scope: Object.values(privileges).join(' '),
    privileges: privileges,
    client_id: token.clientId,
    username: token.principal.nickname,
    token_type: 'refresh_token',
    _links: {
      'authenticated-as': {
        href: url.resolve(process.env.PUBLIC_URI!, token.principal.href),
      }
    }
  };

}

export function inactive() {

  return {
    active: false
  };

}
