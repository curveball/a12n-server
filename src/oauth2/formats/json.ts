import { OAuth2Token } from '../types.ts';

export function tokenResponse(token: OAuth2Token) {
  return {
    access_token: token.accessToken,
    token_type: token.tokenType,
    expires_in: token.accessTokenExpires - Math.round(Date.now() / 1000),
    refresh_token: token.refreshToken,
    id_token: token.idToken,
  };
}
