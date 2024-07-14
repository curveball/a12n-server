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
  /**
   * A secondary URI associated with the user, like a mailto: or tel: URI.
   *
   * @deprecated You should use the 'principal-identity' service to get a list of identities.
   */
  identity: string;
  externalId: string;
  type: TType;
  nickname: string;
  createdAt: Date;
  modifiedAt: Date;
  active: boolean;
  system: boolean;
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

/**
 * Structure of a principal before it's inserted in the database.
 */
export type NewPrincipal<TType extends PrincipalType> = {
  type: TType;
  identity: string;
  nickname: string;
  createdAt: Date;
  modifiedAt: Date;
  active: boolean;
}

/**
 * Principal statistics
 */
export type PrincipalStats = {
  user: number;
  app: number;
  group: number;
};

/**
 * The OAuth2 client refers to a single (programmatic) client, accessing
 * an API.
 *
 * OAuth2 clients are associated to 'Apps'. Each 'app' may have multiple
 * OAuth2 clients.
 */
export type OAuth2Client = {

  /**
   * Unique, internal id.
   */
  id: number;

  /**
   * Route to this client
   */
  href: string;

  /**
   * A string that's used to configure OAuth2 clients.
   */
  clientId: string;


  /**
   * A secret string. This is hashed using bcrypt2
   */
  clientSecret: string;

  app: App;

  /**
   * List of allowed grantTypes this client may use.
   */
  allowedGrantTypes: GrantType[];

  /**
   * Require PKCE for authorization_code flows.
   */
  requirePkce: boolean;
};
