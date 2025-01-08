import { AbstractLoginChallenge } from './abstract.js';
import { AuthorizationChallengeRequest, LoginSession } from '../types.js';
import { A12nLoginChallengeError } from '../error.js';
import * as services from '../../services.js';
import { InvalidGrant } from '../../oauth2/errors.js';
import { getSetting } from '../../server-settings.js';

type TotpParameters = {
  totp_code: string;
}

/**
 * Time-based-one-time-passwords.
 *
 * This strategy handles authenticator apps.
 */
export class LoginChallengeTotp extends AbstractLoginChallenge<TotpParameters> {

  /**
   * The type of authentication factor this class provides.
   */
  readonly authFactor = 'totp';

  /**
   * Returns true if the user has this auth factor set up.
   *
   * For example, if a user has a TOTP device setup this should
   * return true for the totp challenge class.
   */
  async userHasChallenge(): Promise<boolean> {

    const serverTotpMode = getSetting('totp');
    if (serverTotpMode === 'disabled') return false;
    return services.mfaTotp.hasTotp(this.principal);

  }

  async checkResponse(session: LoginSession, parameters: TotpParameters): Promise<boolean> {

    const serverTotpMode = getSetting('totp');
    if (serverTotpMode === 'disabled') {
      // Server-wide TOTP disabled.
      return true;
    }
    const hasTotp = await services.mfaTotp.hasTotp(this.principal);
    if (!hasTotp) {
      // Does this server require TOTP
      if (serverTotpMode === 'required') {
        throw new InvalidGrant('This server is configured to require TOTP, and this user does not have TOTP set up. Logging in is not possible for this user in its current state. Contact an administrator');
      }
      // User didn't have TOTP so we just pass them
      return true;
    }
    if (!parameters.totp_code) {
      // No TOTP code was provided
      throw new A12nLoginChallengeError(
        session,
        'Please provide a TOTP code from the user\'s authenticator app.',
        'totp_required',
      );
    }
    if (!await services.mfaTotp.validateTotp(this.principal, parameters.totp_code)) {
      this.log('totp-failed');
      // TOTP code was incorrect
      throw new A12nLoginChallengeError(
        session,
        'Incorrect TOTP code. Make sure your system clock is set to the correct time and try again',
        'totp_invalid',
      );
    } else {
      this.log('totp-success');
    };

    // TOTP check successful!
    return true;

  }
  /**
   * Should return true if parameters contain a response to the challenge.
   *
   * For example, for the password challenge this checks if the paremters contained
   * a 'password' key.
   */
  parametersContainsResponse(parameters: AuthorizationChallengeRequest): parameters is TotpParameters {

    return parameters.totp_code !== undefined;

  }

  /**
   * Emits the initial challenge.
   *
   * This notifies the user that some kind of response is expected as a reply
   * to this challenge.
   */
  challenge(session: LoginSession): never {

    throw new A12nLoginChallengeError(
      session,
      'Please provide a TOTP code from the user\'s authenticator app.',
      'totp_required',
    );

  }

}
