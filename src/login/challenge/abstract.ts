import { AuthorizationChallengeRequest } from '../types.js';
import { PrincipalIdentity, User } from '../../types.js';
import { AuthFactorType } from '../../user-auth-factor/types.js';
import { UserEventLogger } from '../../log/types.js';


/**
 * This abstract class is implemented by various authentication challenge strategies.
 */
export abstract class AbstractLoginChallenge<TChallengeParameters> {

  /**
   * The type of authentication factor this class provides.
   */
  abstract readonly authFactor: AuthFactorType;

  /**
   * The principal associated with the process.
   *
   * This class will only be used for a single user, so this lets you cache responses if needed.
   */
  protected principal: User;

  /**
   * Logger function
   */
  protected log: UserEventLogger;

  /**
   * IP address of the client initiating authentication.
   */
  protected ip: string;

  /**
   * Specific identity that the user used to login
   */
  protected identity: PrincipalIdentity;

  constructor(principal: User, identity: PrincipalIdentity, logger: UserEventLogger, ip: string) {
    this.principal = principal;
    this.identity = identity;
    this.log = logger;
    this.ip = ip;
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
  abstract checkResponse(parameters: TChallengeParameters): Promise<boolean>;

  /**
   * Should return true if parameters contain a response to the challenge.
   *
   * For example, for the password challenge this checks if the paremters contained
   * a 'password' key.
   */
  abstract parametersContainsResponse(parameters: AuthorizationChallengeRequest): parameters is TChallengeParameters & AuthorizationChallengeRequest;

  /**
   * Emits the initial challenge.
   *
   * This notifies the user that some kind of response is expected as a reply
   * to this challenge.
   */
  abstract challenge(): Promise<never>;

  /**
   * Validates whether the parameters object contains expected values.
   *
   * This for instance will make sure  that a 'password' key was provided for
   * the Password challenge.
   */
  validateParameters(parameters: AuthorizationChallengeRequest): asserts parameters is TChallengeParameters & AuthorizationChallengeRequest {
    if (!this.parametersContainsResponse(parameters)) {
      throw new Error('Invalid state. This should normally not happen unless there\'s a logic bug');
    }
  }

}
