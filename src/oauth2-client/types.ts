import { App } from '../principal/types';

export type GrantType = 'refresh_token' | 'client_credentials' | 'password' | 'implicit' | 'authorization_code';

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
  id: number,

  /**
   * A string that's used to configure OAuth2 clients.
   */
  clientId: string,


  /**
   * A secret string. This is hashed using bcrypt2
   */
  clientSecret: string;

  app: App,

  /**
   * List of allowed grantTypes this client may use.
   */
  allowedGrantTypes: GrantType[],
};
