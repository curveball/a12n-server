/**
 * OAuth2 grant types
 */
export type GrantType =
  | 'refresh_token'
  | 'client_credentials'
  | 'password'
  | 'implicit'
  | 'authorization_code'
  | 'one-time-token' // a12n-server tokens for things like password reset
  | 'developer-token'; // User-generated developer token

export type ServerStats = {
  user: number;
  app: number;
  group: number;
  privileges: number;
  tokensIssued: number;
}

