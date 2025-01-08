import { LoginChallengeContext, AuthorizationChallengeRequest } from '../types.js';
import { User } from '../../types.js';
import { AuthFactorType } from '../../user-auth-factor/types.js';

export abstract class AbstractLoginChallenge {

  /**
   * The principal associated with the process.
   *
   * This class will only be used for a single user, so this lets you cache responses if needed.
   */
  protected principal: User;

  /**
   * The type of authentication factor this class provides.
   */
  abstract readonly authFactor: AuthFactorType;

  constructor(principal: User) {
    this.principal = principal;
  }

  /**
   * Returns true if the user has this auth factor set up.
   *
   * For example, if a user has a TOTP device setup this should
   * return true for the totp challenge class.
   */
  abstract userHasChallenge(): Promise<boolean>;

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

  /**
   * Emits the challenge. This is done in situations that no credentials have
   * been received yet.
   */
  abstract challenge(): never; 

}
