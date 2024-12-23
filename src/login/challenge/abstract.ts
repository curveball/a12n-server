import { LoginChallengeContext } from '../types.js';

export abstract class AbstractLoginChallenge {

  abstract challenge(loginContext: LoginChallengeContext): Promise<void>;

}
