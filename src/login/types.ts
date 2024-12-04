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
   * List of OAuth2 scopes
   */
  scope?: string[];

  /**
   * Internal marker. If something related to the session changed we'll
   * set this to true to indicate the session store should be updated.
   */
  dirty: boolean;

  /**
   * Password was checked.
   */
  passwordPassed: boolean;

  /**
   * TOTP code has been checked
   */
  totpPassed: boolean;

};

/**
 * A login session that's successfully passed the credentials-check stage.
 */
export type LoginSessionStage2 = LoginSession & {

  /**
   * User id
   */
  principalId: number;

  /**
   * Password was checked.
   */
  passwordPassed: true;

}

/**
 * A login session that's passed the TOTP check
 */
export type LoginSessionStage3 = LoginSessionStage2 & {

  /**
   * TOTP code has been checked
   */
  totpPassed: true;

}
