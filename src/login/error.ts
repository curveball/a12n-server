import { OAuth2Error } from '../oauth2/errors.js';
import { LoginSession } from './types.js';

type ChallengeErrorCode =
  // Account is not activated
  | 'account_not_active'
  // The principal associated with the credentials are not a user
  | 'not_a_user'
  // Username or password was wrong
  | 'username_or_password_invalid'
  // Username or password must be provided
  | 'username_or_password_required'
  // User must enter a TOTP code to continue
  | 'totp_required'
  // The TOTP code that was provided is invalid.
  | 'totp_invalid'
  // The email address used to log in was not verified
  | 'email_not_verified';

export class A12nLoginChallengeError extends OAuth2Error {

  httpStatus = 400;
  errorCode: ChallengeErrorCode;
  session: LoginSession;

  constructor(session: LoginSession, message: string, errorCode: ChallengeErrorCode) {

    super(message);
    this.errorCode = errorCode;
    this.session = session;

  }

  serializeErrorBody() {

    return {
      error: this.errorCode,
      error_description: this.message,
      auth_session: this.session.authSession,
      expires_at: this.session.expiresAt,
    };

  }

}
