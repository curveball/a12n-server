import { AbstractLoginChallenge } from './abstract.js';
import { AuthorizationChallengeRequest } from '../types.js';
import { A12nLoginChallengeError } from '../error.js';
import * as services from '../../services.js';
import { PrincipalIdentity } from '../../types.js';
import { BadRequest } from '@curveball/http-errors';
import { markVerified } from '../../principal-identity/service.js';

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
  * Returns true if an unverified email identity is found,
  */

  async userHasChallenge(): Promise<boolean> {

    const identity = await this.findUnverifiedEmailIdentity();
    return identity !== null;

  }

  /**
   * Handle the user response to a challenge.
   *
   * Should return true if the challenge passed.
   * Should throw an Error ihe challenge failed.
   */
  async checkResponse(parameters: EmailVerification): Promise<boolean> {

    const identity = await this.findMfaIdentity(true);

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
        await services.principalIdentity.sendVerificationRequest(identity, this.ip)
        throw new A12nLoginChallengeError(
          'Invalid or expired email_verification',
          'email_not_verified',
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

    const identity = await this.findMfaIdentity(true);
    await services.principalIdentity.sendVerificationRequest(identity, this.ip)
    throw new A12nLoginChallengeError(
      `An email has been sent to ${identity.uri.slice(7)} with a code to verify your identity.`,
      'email_not_verified',
      {
        censored_email: censor(identity.uri)
      }
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
    if (must) throw new Error('Could not find an email identity usable for MFA');
    return null;

  }

  private async findUnverifiedEmailIdentity(must = false): Promise<PrincipalIdentity|null> {
    if (this.identityCache) return this.identityCache;
    const identities = await services.principalIdentity.findByPrincipal(this.principal);
    for (const identity of identities) {
      // Check if the identity is an email address and unverified
      if (identity.uri.startsWith('mailto:') && identity.isMfa && identity.verifiedAt === null) {
        this.identityCache = identity;
        return identity;
      }
    }
    if (must) throw new Error('Could not find an unverified email identity usable for MFA');
    return null;
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
