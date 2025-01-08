import { AbstractLoginChallenge } from './abstract.js';
import { AuthorizationChallengeRequest } from '../types.js';
import { A12nLoginChallengeError } from '../error.js';
import * as services from '../../services.js';
import { PrincipalIdentity } from '../../types.js';
import { BadRequest } from '@curveball/http-errors';

type EmailOtpParameters = {
  email_otp_code: string;
}

/**
 * Password-based authentication strategy.
 */
export class LoginChallengeEmailOtp extends AbstractLoginChallenge<EmailOtpParameters> {

  /**
   * The type of authentication factor this class provides.
   */
  readonly authFactor = 'email-otp';

  /**
   * Returns true if the user has this auth factor set up.
   *
   * For example, if a user has a TOTP device setup this should
   * return true for the totp challenge class.
   */
  async userHasChallenge(): Promise<boolean> {

    const identity = await this.findMfaIdentity();
    return identity !== null;

  }

  /**
   * Handle the user response to a challenge.
   *
   * Should return true if the challenge passed.
   * Should throw an Error ihe challenge failed.
   */
  async checkResponse(parameters: EmailOtpParameters): Promise<boolean> {

    const identity = await this.findMfaIdentity(true);

    try {
      await services.principalIdentity.verifyIdentity(
        identity,
        parameters.email_otp_code
      );
      return true;
    } catch (err) {
      if (err instanceof BadRequest) {
        throw new A12nLoginChallengeError('Invalid or expired email_otp_code', 'email_otp_invalid');
      } else {
        throw err;
      }
    }

  }

  /**
   * Should return true if parameters contain a response to the challenge.
   *
   * For example, for the password challenge this checks if the paremters contained
   * a 'password' key.
   */
  parametersContainsResponse(parameters: AuthorizationChallengeRequest): parameters is EmailOtpParameters & AuthorizationChallengeRequest {

    console.log('contains-response', parameters);
    return parameters.email_opt_code !== undefined;

  }

  /**
   * Emits the initial challenge.
   *
   * This notifies the user that some kind of response is expected as a reply
   * to this challenge.
   */
  async challenge(): Promise<never> {

    console.log('challenge-now');
    const identity = await this.findMfaIdentity(true);
    await services.principalIdentity.sendVerificationRequest(identity, this.ip);
    throw new A12nLoginChallengeError(
      `An email has been sent to ${identity.uri.slice(7)} with a code to verify your identity.`,
      'email_otp_required'
    );

  }

  private identityCache: PrincipalIdentity | null = null;

  /**
   * Finds a MFA identity that uses a mailto: address.
   */
  private async findMfaIdentity(must: true): Promise<PrincipalIdentity>;
  private async findMfaIdentity(): Promise<PrincipalIdentity|null>; 
  private async findMfaIdentity(must = false): Promise<PrincipalIdentity|null> {

    if (this.identityCache) return this.identityCache;
    const identities = await services.principalIdentity.findByPrincipal(this.principal);
    for (const identity of identities) {
      if (identity.isMfa && identity.uri.startsWith('mailto:')) {
        this.identityCache = identity;
        return identity;
      }
    }
    if (must) throw new Error('Could not find an email identity usable for ma');
    return null;

  }

}
