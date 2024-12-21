export type AuthFactorType = 'password' | 'totp' | 'email-otp';

export interface UserAuthFactor {

  /**
   * Local API uri to the auth factor.
   */
  href: string;

  /**
   * Nickname of the auth factor.
   */
  title: string;

  /**
   * What kind of auth factor is this?
   */
  type: AuthFactorType,

}
