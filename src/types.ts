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
  | 'developer-token' // User-generated developer token
  | 'authorization_challenge'; // https://www.ietf.org/archive/id/draft-parecki-oauth-first-party-apps-00.html

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
  nickname: string;
  createdAt: Date;
  modifiedAt: Date;
  active: boolean;
}

/**
 * The PrincipalIdentity is some associated id with a principal, such
 * as a email address for a user or a https:// uri for an app.
 */
export type PrincipalIdentity = {
  id: number;

  /**
   * Public-facing unique id, used in URL and such.
   */
  externalId: string;

  /**
   * External URI for the principal. Usually a mailto: for an associated email
   * address, or a tel: for a phone number.
   */
  uri: string;

  /**
   * API uri to find the resource.
   */
  href: string;

  /**
   * Associated principal
   */
  principalId: number;

  /**
   * If this is the 'main' ID for a user, this is set to true.
   * There should usually only be one identity that has this flag.
   */
  isPrimary: boolean;

  /**
   * Optional, user supplied label for the identity. For example 'Home', 'Work' or 'Mobile'.
   */
  label: string | null;

  /**
   * If set, when the user verified ownership of the id.
   *
   * For uuid IDs this will automatically be set to true, but email and tel ids may need
   * to be sent a verification code which the user needs to enter back into the system.
   *
   * Trusted clients of the API may also set this.
   */
  verifiedAt: Date | null;

  /**
   * When the identity was first created.
   */
  createdAt: Date;

  /**
   * Last time the identity was updated.
   */
  modifiedAt: Date;
}

export type NewPrincipalIdentity = Omit<PrincipalIdentity, 'id' | 'href' | 'externalId' | 'createdAt' | 'modifiedAt' | 'verifiedAt'> & {
  /**
   * Immediately mark the identity as verified.
   */
  markVerified: boolean;
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
 * The App Client refers to a single set of credentials for an app.
 *
 * The app client usually refers to an oauth2_client, and defines its
 * client_id, client_secret and which OAuth2 flows its allowed to use.
 *
 * Apps can have multiple 'clients' because this allows apps to create
 * new credentials while not immediately disabling old ones, or to
 * create different credential sets with diffent grant types.
 */
export type AppClient = {

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
