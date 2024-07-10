import { App, User, GrantType } from '../types.js';

export type OAuth2Token = {

  /**
   * OAuth2 Access token
   */
  accessToken: string;

  /**
   * OAuth2 Refresh token
   */
  refreshToken: string;

  /**
   * Unix timestamp of when the token expires (in seconds)
   */
  accessTokenExpires: number;

  /**
   * Unix timestamp of when the token expires (in seconds)
   */
  refreshTokenExpires: number;

  /**
   * Type of token. Only 'bearer' is supported rn.
   */
  tokenType: 'bearer';

  /*
   * The user or app that this token auhtenticates.
   */
  principal: App | User;

  /*
   * The OAuth2 client (app) that created this token.
   */
  clientId: number;

  /**
   * OAuth2 Grant Type used to create this token.
   */
  grantType: Exclude<GrantType, 'refresh_token'> | null;

  /**
   * True if a client_secret was used to generate the token.
   *
   * Certain flows (authorization_code, implicit) don't require it but
   * if a token was generated with a secret, it must also be refreshed
   * with a secret.
   */
  secretUsed: boolean;

  /**
   * OAuth2 scopes
   */
  scope: string[];

  /**
   * If the token was created via a browser-flow, such as implicit or
   * authorization_code, this will contain the browser session cookie
   * id.
   */
  browserSessionId?: string;

  /**
   * OpenID Connect idToken
   */
  idToken?: string;
};

export type OAuth2Code = {
  code: string;
};

export type CodeChallengeMethod = 'plain' | 'S256';
