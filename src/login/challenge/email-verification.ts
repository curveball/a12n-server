import { AbstractLoginChallenge } from './abstract.ts';
import { AuthorizationChallengeRequest } from '../types.ts';
import { A12nLoginChallengeError } from '../error.ts';
import * as services from '../../services.ts';
import { BadRequest } from '@curveball/http-errors';
import { markVerified } from '../../principal-identity/service.ts';

type EmailVerification = {
  email_verification_code: string;
}


/**
 * Password-based authentication strategy.
 */
export class LoginChallengeEmailVerification extends AbstractLoginChallenge<EmailVerification> {

  /**
   * The type of authentication factor this class provides.
   */
  readonly authFactor = 'email-verification';

  /**
  * Checks if the user has an unverified email.
  * Returns true if an unverified email identity is found.
  */

  async userHasChallenge(): Promise<boolean> {
    return  this.identity.uri.startsWith('mailto:') && this.identity.verifiedAt === null;
  }

  /**
   * Handle the user response to a challenge.
   *
   * Should return true if the challenge passed.
   * Should throw an Error ihe challenge failed.
   */
  async checkResponse(parameters: EmailVerification): Promise<boolean> {

    const identity = await this.identity;

    try {
      await services.principalIdentity.verifyIdentity(
        identity,
        parameters.email_verification_code
      );

      // Mark the identity as verified
      await markVerified(identity);
      return true;
    } catch (err) {
      if (err instanceof BadRequest) {
        await services.principalIdentity.sendVerificationRequest(identity, this.ip);
        throw new A12nLoginChallengeError(
          'Invalid or expired email_verification',
          'email_verification_code_invalid',
          { censored_email: censor(identity.uri) }
        );
      } else {
        throw err;
      }
    }

  }


  parametersContainsResponse(parameters: AuthorizationChallengeRequest): parameters is EmailVerification & AuthorizationChallengeRequest {
    return parameters.email_verification_code !== undefined;
  }


  /**
   * Emits the initial challenge.
   *
   * This notifies the user that some kind of response is expected as a reply
   * to this challenge.
   */
  async challenge(): Promise<never> {

    const identity = await this.identity;
    await services.principalIdentity.sendVerificationRequest(identity, this.ip);
    throw new A12nLoginChallengeError(
      `An email has been sent to ${identity.uri.slice(7)} with a code to verify your identity.`,
      'email_not_verified',
      {
        censored_email: censor(identity.uri)
      }
    );

  }
}


function censor(email: string): string {

  email = email.toLowerCase();
  if (email.startsWith('mailto:')) email = email.slice(7);

  const [user, domain] = email.split('@');
  return (
    user.slice(0, 2).padEnd(user.length, '*') +
    '@' +
    domain.slice(0, 2).padEnd(domain.length-2, '*') +
    domain.slice(-2)
  );

}
