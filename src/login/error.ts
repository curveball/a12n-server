import { OAuth2Error } from '../oauth2/errors.js';
import { LoginSession } from './types.js';

type ChallengeErrorCode =
  // Account is not activated
  | 'account_not_active'
  // The principal associated with the credentials is not a user
  | 'not_a_user'
  // The user doesn't have any credentials set up
  | 'no_credentials'
  // Username or password was wrong
  | 'username_or_password_invalid'
  // Username must be provided
  | 'username_required'
  // Password must be provided
  | 'password_required'
  // User must enter a TOTP code to continue
  | 'totp_required'
  // The TOTP code that was provided is invalid.
  | 'totp_invalid'
  // The email address used to log in was not verified
  | 'email_not_verified';

export class A12nLoginChallengeError extends OAuth2Error {

  httpStatus = 400;
  errorCode: ChallengeErrorCode;
  session: LoginSession | null;

  constructor(message: string, errorCode: ChallengeErrorCode, session?: LoginSession) {

    super(message);
    this.errorCode = errorCode;
    this.session = session ?? null;

  }

  serializeErrorBody() {

    if (this.session) {
      return {
        error: this.errorCode,
        error_description: this.message,
        auth_session: this.session.authSession,
        expires_at: this.session.expiresAt,
      };
    } else {
      return {
        error: this.errorCode,
        error_description: this.message,
      };
    }

  }

}
