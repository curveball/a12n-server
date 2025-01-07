import { LoginChallengeContext, AuthorizationChallengeRequest } from '../types.js';
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

  /**
   * Handle the user response to a challenge.
   *
   * Should return true if the challenge passed.
   * Should throw an Error ihe challenge failed.
   */
  abstract checkResponse(loginContext: LoginChallengeContext): Promise<boolean>;

  /**
   * Should return true if parameters contain a response to the challenge.
   *
   * For example, for the password challenge this checks if the paremters contained
   * a 'password' key.
   */
  abstract parametersHasResponse(parameters: AuthorizationChallengeRequest): boolean;

}
