import { AuthFactorType } from '../user-auth-factor/types.js';
export { AuthorizationChallengeRequest } from '../api-types.js';

/**
 * The login session represents an ongoing login process for a specific
 * user.
 *
 * Logins may happen as a multi-step process, including asking for a username
 * and password and multi-factor auth.
 *
 * This object keeps track of this process.
 */
export type LoginSession = {

  /**
   * Unique id associated with the session.
   */
  authSession: string;

  /**
   * The OAuth2 client_id associated with the session.
   */
  appClientId: number;

  /**
   * Unix timestamp (in seconds) when the login session expires
   */
  expiresAt: number;

  /**
   * User id
   */
  principalId: number | null;

  /**
   * Identity ID
   */
  principalIdentityId: number | null;

  /**
   * List of OAuth2 scopes
   */
  scope?: string[];

  /**
   * Which Auth Factors have been successfully checked during the current
   * session.
   */
  challengesCompleted: AuthFactorType[];

};

/**
 * A login session with a confirmed principal id and identity.
 */
export type LoginSessionWithPrincipal = LoginSession & {

  /**
   * User id
   */
  principalId: number;

  /**
   * Identity ID
   */
  principalIdentityId: number;
}
