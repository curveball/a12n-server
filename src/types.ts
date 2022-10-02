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

/**
 * List of possible principal types.
 */
export type PrincipalType = 'user' | 'app' | 'group';

export const PrincipalTypeList: PrincipalType[] = ['user', 'app', 'group'];

/** Base principal that everything inherits from
 */
export type BasePrincipal<TType extends PrincipalType> = {
  id: number;
  href: string;
  externalId: string;
  type: TType;
  identity: string;
  nickname: string;
  createdAt: Date;
  modifiedAt: Date;
  active: boolean;
}

/**
 * User. This represents a person
 */
export type User = BasePrincipal<'user'>;

/**
 * A group can contain multiple users or other groups and lets you assign
 * privileges to entire groups of people.
 */
export type Group = BasePrincipal<'group'>;

/**
 * Apps represent systems / oauth2 clients.
 */
export type App = BasePrincipal<'app'>;

/**
 * Any principal
 */
export type Principal = User | Group | App;
