import { BadRequest, NotFound } from '@curveball/http-errors';
import { LoginSession, LoginSessionStage2, LoginSessionStage3 } from './types.js';
import { AuthorizationChallengeRequest } from '../api-types.js';
import { InvalidGrant, OAuth2Error } from '../oauth2/errors.js';
import { OAuth2Code } from '../oauth2/types.js';
import { getSetting } from '../server-settings.js';
import * as services from '../services.js';
import { getSessionStore } from '../session-store.js';
import { AppClient, Principal, PrincipalIdentity, User } from '../types.js';
import { getLogger } from '../log/service.js';
import { UserEventLogger } from '../log/types.js';

type ChallengeRequest = AuthorizationChallengeRequest;

/**
 * How long until a login session expires (in seconds)
 */
const LOGIN_SESSION_EXPIRY = 60*20;

/**
 * Get a login session by providing login information.
 *
 * Logins may consist of multiple steps. We need to keep track of what information
 * was supplied across each step.
 *
 * This function starts such a session, which may later be continued by using
 * a login session id. (authSession).
 *
 * This function can be used to either kick off a new session, or continue the session.
 */
export async function getSession(client: AppClient, parameters: ChallengeRequest): Promise<LoginSession> {

  if (parameters.auth_session) {
    if (parameters.scope) {
      throw new BadRequest('Currently you\'re only allowed to specify the scope parameter on the first authorization_challenge request');
    }
    return continueLoginSession(client, parameters.auth_session);
  } else {
    return startLoginSession(client, parameters.scope?.split(' '));
  }

}

async function startLoginSession(client: AppClient, scope?: string[]): Promise<LoginSession> {

  const store = getSessionStore();
  const id: string = await store.newSessionId();

  return {
    authSession: id,
    appClientId: client.id,
    expiresAt: Math.floor(Date.now() / 1000) + LOGIN_SESSION_EXPIRY,
    principalId: null,
    passwordPassed: false,
    totpPassed: false,
    scope,
    dirty: true,
  };

}

/**
 * Validate a login challenge request.
 *
 * If the challenge contained any correct values, they will be stored in the
 * login session, and don't need to be re-submitted.
 *
 * If more credentials are needed or if any information is incorrect, an error
 * will be thrown.
 */
export async function challenge(client: AppClient, session: LoginSession, parameters: ChallengeRequest): Promise<OAuth2Code> {

  let user;
  // If set to true, we'll log this as a 'session started' event for this user.
  let logSessionStart = false;

  try {
    const principalService = new services.principal.PrincipalService('insecure');
    if (!session.principalId) {
      await challengeUsernamePassword(session, parameters);
      logSessionStart = true;
    }
    assertSessionStage2(session);

    user = await principalService.findById(session.principalId, 'user');
    const log = getLogger(
      user,
      parameters.remote_addr ?? null,
      parameters.user_agent ?? null
    );
    if (logSessionStart) log('login-challenge-started');

    if (!session.totpPassed) {
      await challengeTotp(session, parameters, user, log);
    }

    assertSessionStage3(session);

    log('login-challenge-success');

  } finally {

    if (session.dirty) {
      await storeSession(session);
      session.dirty = false;
    }

  }

  await deleteSession(session);

  return await services.oauth2.generateAuthorizationCode({
    client,
    principal: user,
    scope: session.scope ?? [],
    redirectUri: null,
    grantType: 'authorization_challenge',
    browserSessionId: session.authSession,
    codeChallenge: null,
    codeChallengeMethod: null,
    nonce: null,
  });

}

async function continueLoginSession(client: AppClient, authSession: string): Promise<LoginSession> {

  const store = getSessionStore();
  const session: LoginSession|null = await store.get(authSession) as LoginSession|null;

  if (session === null) {
    throw new InvalidGrant('Invalid auth_session');
  }

  if (session.appClientId != client.id) {
    throw new InvalidGrant('The client you authenticated with did not start this login session');
  }

  return session;

}

async function storeSession(session: LoginSession) {

  const store = getSessionStore();
  await store.set(session.authSession, session, session.expiresAt);

}
async function deleteSession(session: LoginSession) {

  const store = getSessionStore();
  await store.delete(session.authSession);

}

async function challengeUsernamePassword(session: LoginSession, parameters: ChallengeRequest): Promise<User> {

  if (parameters.username === undefined || parameters.password === undefined) {
    throw new A12nLoginChallengeError(
      session,
      'A username and password are required',
      'username_or_password_required',
    );

  }
  const principalService = new services.principal.PrincipalService('insecure');
  let user: Principal;
  let identity: PrincipalIdentity;
  try {
    identity = await services.principalIdentity.findByUri('mailto:' + parameters.username);
  } catch (err) {
    if (err instanceof NotFound) {
      throw new A12nLoginChallengeError(
        session,
        'Incorrect username or password',
        'username_or_password_invalid',
      );
    } else {
      throw err;
    }

  }

  try {
    user = await principalService.findByIdentity(identity);
  } catch (err) {
    if (err instanceof NotFound) {
      throw new A12nLoginChallengeError(
        session,
        'Incorrect username or password',
        'username_or_password_required',
      );
    } else {
      throw err;
    }
  }

  if (user.type !== 'user') {
    throw new A12nLoginChallengeError(
      session,
      'Credentials are not associated with a user',
      'not_a_user',
    );
  }

  const log = getLogger(
    user,
    parameters.remote_addr ?? null,
    parameters.user_agent ?? null
  );
  const { success, errorMessage } = await services.user.validateUserCredentials(user, parameters.password, log);
  if (!success && errorMessage) {
    throw new A12nLoginChallengeError(
      session,
      errorMessage,
      'username_or_password_invalid',
    );
  }

  session.principalId = user.id;
  session.passwordPassed = true;
  session.dirty = true;

  if (!user.active) {
    log('login-failed-inactive');
    throw new A12nLoginChallengeError(
      session,
      'This account is not active. Please contact support',
      'account_not_active',
    );
  }
  if (identity.verifiedAt === null) {
    log('login-failed-notverified');
    throw new A12nLoginChallengeError(
      session,
      'Email is not verified',
      'email_not_verified',
    );
  }

  return user;
}

/**
 * This function is responsible for ensuring that if TOTP is set up for a user,
 * it gets checked.
 */
async function challengeTotp(session: LoginSession, parameters: ChallengeRequest, user: User, log: UserEventLogger): Promise<void> {

  const serverTotpMode = getSetting('totp');
  if (serverTotpMode === 'disabled') {
    // Server-wide TOTP disabled.
    session.totpPassed = true;
    session.dirty = true;
    return;
  }
  const hasTotp = await services.mfaTotp.hasTotp(user);
  if (!hasTotp) {
    // Does this server require TOTP
    if (serverTotpMode === 'required') {
      throw new InvalidGrant('This server is configured to require TOTP, and this user does not have TOTP set up. Logging in is not possible for this user in its current state. Contact an administrator');
    }
    // User didn't have TOTP so we just pass them
    session.totpPassed = true;
    session.dirty = true;
    return;
  }
  if (!parameters.totp_code) {
    // No TOTP code was provided
    throw new A12nLoginChallengeError(
      session,
      'Please provide a TOTP code from the user\'s authenticator app.',
      'totp_required',
    );
  }
  if (!await services.mfaTotp.validateTotp(user, parameters.totp_code)) {
    log('totp-failed');
    // TOTP code was incorrect
    throw new A12nLoginChallengeError(
      session,
      'Incorrect TOTP code. Make sure your system clock is set to the correct time and try again',
      'totp_invalid',
    );
  } else {
    log('totp-success');
  };

  // TOTP check successful!
  session.totpPassed = true;
  session.dirty = true;

}

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

class A12nLoginChallengeError extends OAuth2Error {

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

function assertSessionStage2(session: LoginSession): asserts session is LoginSessionStage2 {

  if (!session.principalId) {
    throw new Error('Invalid state: missing principalId');
  }
  if (!session.passwordPassed) {
    throw new Error('Invalid state: passwordPassed was false');
  }

}
function assertSessionStage3(session: LoginSession): asserts session is LoginSessionStage3 {

  if (!session.totpPassed)  {
    throw new Error('Invalid state: totpChecked should have been true');
  }

}
