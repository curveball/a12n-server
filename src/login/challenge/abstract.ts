import { LoginChallengeContext } from '../types.js';
import { User } from '../../types.js';

export abstract class AbstractLoginChallenge {

  protected principal: User;

  constructor(principal: User) {
    this.principal = principal;
  }

  /**
   * Returns true if the user has this auth factor set up.
   *
   * For example, if a user has a TOTP device setup this should
   * return true for the totp challenge class.
   */
  abstract hasFactor(): Promise<boolean>;

  abstract challenge(loginContext: LoginChallengeContext): Promise<void>;

}
