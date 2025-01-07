import { AbstractLoginChallenge } from './abstract.js';
import { LoginChallengeContext, AuthorizationChallengeRequest } from '../types.js';
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

  /**
   * Handle the user response to a challenge.
   *
   * Should return true if the challenge passed.
   * Should throw an Error ihe challenge failed.
   */
  async checkResponse(loginContext: LoginChallengeContext): Promise<boolean> {

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
    return true;

  }

  /**
   * Should return true if parameters contain a response to the challenge.
   *
   * For example, for the password challenge this checks if the paremters contained
   * a 'password' key.
   */
  parametersHasResponse(parameters: AuthorizationChallengeRequest): boolean {

    return parameters.password  !== undefined;

  }

}
