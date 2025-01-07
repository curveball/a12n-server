import { AbstractLoginChallenge } from './abstract.js';
import { LoginChallengeContext } from '../types.js';
import { A12nLoginChallengeError } from '../error.js';
import * as services from '../../services.js';

export class LoginChallengePassword extends AbstractLoginChallenge {
  /**
   * Returns true if the user has this auth factor set up.
   *
   * For example, if a user has a TOTP device setup this should
   * return true for the totp challenge class.
   */
  hasFactor(): Promise<boolean> {

    return services.user.hasPassword(this.principal);

  }

  async challenge(loginContext: LoginChallengeContext): Promise<void> {

    if (loginContext.parameters.password === undefined) {
      throw new A12nLoginChallengeError(
        loginContext.session,
        'A username and password are required',
        'username_or_password_required',
      );

    }

    const { success, errorMessage } = await services.user.validateUserCredentials(loginContext.principal, loginContext.parameters.password, loginContext.log);
    if (!success && errorMessage) {
      throw new A12nLoginChallengeError(
        loginContext.session,
        errorMessage,
        'username_or_password_invalid',
      );
    }

    loginContext.session.authFactorsPassed.push('password');
    loginContext.dirty = true;

  }

}
