import { User } from '../user/types';

export type OAuth2Token = {
  // OAuth2 Access token
  accessToken: string,

  // OAuth2 Refresh token
  refreshToken: string,

  // Unix timestamp of when the token expires (in seconds)
  accessTokenExpires: number,

  // Type of token. Only 'bearer' is supported rn.
  tokenType: 'bearer',

  // The user this token belongs to
  user: User,

  // The OAuth2 client (app) that created this session
  clientId: number,

  // If the token was created via a browser-flow, such as implicit or
  // authorization_code, this will contain the browser session cookie
  // id.
  browserSessionId?: string,
};

export type OAuth2Code = {
  code: string;
};

export type CodeChallengeMethod = 'plain' | 'S256';
