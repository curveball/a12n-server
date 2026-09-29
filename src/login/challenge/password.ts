import { AbstractLoginChallenge } from './abstract.ts';
import { AuthorizationChallengeRequest } from '../types.ts';
import { A12nLoginChallengeError } from '../error.ts';
import * as services from '../../services.ts';
import { IncorrectPassword, TooManyLoginAttemptsError } from '../../user/error.ts';

type PasswordParameters = {
  password: string;
}

/**
 * Password-based authentication strategy.
 */
export class LoginChallengePassword extends AbstractLoginChallenge<PasswordParameters> {

  /**
   * The type of authentication factor this class provides.
   */
  readonly authFactor = 'password';

  /**
   * Returns true if the user has this auth factor set up.
   *
   * For example, if a user has a TOTP device setup this should
   * return true for the totp challenge class.
   */
  userHasChallenge(): Promise<boolean> {

    return services.user.hasPassword(this.principal);

  }

  /**
   * Handle the user response to a challenge.
   *
   * Should return true if the challenge passed.
   * Should throw an Error ihe challenge failed.
   */
  async checkResponse(parameters: PasswordParameters): Promise<boolean> {

    try {
      await services.user.validateUserCredentials(this.principal, parameters.password, this.log);
    } catch (err) {
      if (err instanceof IncorrectPassword) {
        throw new A12nLoginChallengeError(
          err.message,
          'username_or_password_invalid',
        );
      } else if (err instanceof TooManyLoginAttemptsError) {
        throw new A12nLoginChallengeError(
          err.message,
          'too_many_failed_login_attempts',
        );
      } else {
        throw err;
      }
    }

    return true;

  }

  /**
   * Should return true if parameters contain a response to the challenge.
   *
   * For example, for the password challenge this checks if the paremters contained
   * a 'password' key.
   */
  parametersContainsResponse(parameters: AuthorizationChallengeRequest): parameters is PasswordParameters {

    return parameters.password  !== undefined;

  }

  /**
   * Emits the initial challenge.
   *
   * This notifies the user that some kind of response is expected as a reply
   * to this challenge.
   */
  challenge(): never {

    throw new A12nLoginChallengeError(
      'A password is required',
      'password_required',
    );

  }

}
