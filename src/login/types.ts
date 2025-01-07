import { User, PrincipalIdentity } from '../types.js';
import { AuthFactorType } from '../user-auth-factor/types.js';
import { UserEventLogger } from '../log/types.js';
import { AuthorizationChallengeRequest } from '../api-types.js';
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
  authFactorsPassed: AuthFactorType[];

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


export type LoginChallengeContext = {

  /**
   * The user that's trying to authenticate
   */
  principal: User;

  /**
   * The identity (email address usually) of the principal that was used to
   * start this challenge, usually supplied as a username.
   */
  identity: PrincipalIdentity;

  /**
   * Easy access to a logger
   */
  log: UserEventLogger;

  /**
   * Parameters sent with the *current* request.
   */
  parameters: AuthorizationChallengeRequest;

  /**
   * Session data associated with the login challenge process.
   * This is persistent data.
   */
  session: LoginSession;

  /**
   * Set to true if session data changed and we need to save
   * it again.
   */
  dirty: boolean;

}
