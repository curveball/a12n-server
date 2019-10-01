import { OAuth2Token } from '../../oauth2/types';

export function accessToken(token: OAuth2Token) {

  return {
    active: true,
    client_id: token.clientId,
    token_type: 'bearer',
    exp: token.accessTokenExpires,
  };

}

export function refreshToken(token: OAuth2Token) {

  return {
    active: true,
    client_id: token.clientId,
    token_type: 'refresh_token',
  };

}

export function inactive() {

  return {
    active: false
  }

}
