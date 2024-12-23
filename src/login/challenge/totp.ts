import { AbstractLoginChallenge } from './abstract.js';
import { LoginChallengeContext } from '../types.js';
import { A12nLoginChallengeError } from '../error.js';
import * as services from '../../services.js';
import { InvalidGrant } from '../../oauth2/errors.js';
import { getSetting } from '../../server-settings.js';
export class LoginChallengeTotp extends AbstractLoginChallenge {

  async challenge(loginContext: LoginChallengeContext): Promise<void> {

    const serverTotpMode = getSetting('totp');
    if (serverTotpMode === 'disabled') {
      // Server-wide TOTP disabled.
      loginContext.session.authFactorsPassed.push('totp');
      loginContext.dirty = true;
      return;
    }
    const hasTotp = await services.mfaTotp.hasTotp(loginContext.principal);
    if (!hasTotp) {
      // Does this server require TOTP
      if (serverTotpMode === 'required') {
        throw new InvalidGrant('This server is configured to require TOTP, and this user does not have TOTP set up. Logging in is not possible for this user in its current state. Contact an administrator');
      }
      // User didn't have TOTP so we just pass them
      loginContext.session.authFactorsPassed.push('totp');
      loginContext.dirty = true;
      return;
    }
    if (!loginContext.parameters.totp_code) {
      // No TOTP code was provided
      throw new A12nLoginChallengeError(
        loginContext.session,
        'Please provide a TOTP code from the user\'s authenticator app.',
        'totp_required',
      );
    }
    if (!await services.mfaTotp.validateTotp(loginContext.principal, loginContext.parameters.totp_code)) {
      loginContext.log('totp-failed');
      // TOTP code was incorrect
      throw new A12nLoginChallengeError(
        loginContext.session,
        'Incorrect TOTP code. Make sure your system clock is set to the correct time and try again',
        'totp_invalid',
      );
    } else {
      loginContext.log('totp-success');
    };

    // TOTP check successful!
    loginContext.session.authFactorsPassed.push('totp');
    loginContext.dirty = true;

  }

}
