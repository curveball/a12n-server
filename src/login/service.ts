import { AppClient, Principal, PrincipalIdentity, User } from '../types.js';
import { getSessionStore } from '../session-store.js';
import { InvalidGrant, OAuth2Error } from '../oauth2/errors.js';
import * as services from '../services.js';
import { BadRequest, NotFound } from '@curveball/http-errors';
import { AuthorizationChallengeRequest } from '../api-types.js';
import { OAuth2Code } from '../oauth2/types.js';

type ChallengeRequest = AuthorizationChallengeRequest;

type LoginSession = {
  authSession: string;
  appClientId: number;

  /**
   * Unix timestamp (in seconds) when the login session expires
   */
  expiresAt: number;

  /**
   * User id
   */
  principalId: number | null;

  /**
   * Password was checked.
   */
  passwordValid: boolean;

  /**
   * List of OAuth2 scopes
   */
  scope?: string[];

  /**
   * Internal marker. If something related to the session changed we'll
   * set this to true to indicate the session store should be updated.
   */
  dirty: boolean;

};

type LoginSessionStage2 = LoginSession & {

  /**
   * User id
   */
  principalId: number;

  /**
   * Password was checked.
   */
  passwordValid: true;

}

/**
 * How long until a login session expires (in seconds)
 */
const LOGIN_SESSION_EXPIRY = 60*20;

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


export async function startLoginSession(client: AppClient, scope?: string[]): Promise<LoginSession> {

  const store = getSessionStore();
  const id: string = await store.newSessionId();

  return {
    authSession: id,
    appClientId: client.id,
    expiresAt: Math.floor(Date.now() / 1000) + LOGIN_SESSION_EXPIRY,
    principalId: null,
    passwordValid: false,
    scope,
    dirty: true,
  };

}

export async function continueLoginSession(client: AppClient, authSession: string): Promise<LoginSession> {

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

export async function storeSession(session: LoginSession) {

  const store = getSessionStore();
  await store.set(session.authSession, session, session.expiresAt);

}
async function deleteSession(session: LoginSession) {

  const store = getSessionStore();
  await store.delete(session.authSession);

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

  try {
    if (!session.principalId) {
      if (parameters.username === undefined || parameters.username === undefined) {
        throw new A12nLoginChallengeError(
          session,
          'A username and password are required',
          'username-password',
          false,
        );

      }
      await challengeUsernamePassword(
        session,
        parameters.password!,
        parameters.username!,
      );

    }


  } finally {

    if (session.dirty) {
      await storeSession(session);
      session.dirty = false;
    }

  }

  assertSessionStage2(session);

  const principalService = new services.principal.PrincipalService('insecure');
  const user = await principalService.findById(session.principalId, 'user');

  await deleteSession(session);

  return await services.oauth2.generateAuthorizationCode({
    client,
    principal: user,
    scope: session.scope ?? [],
    browserSessionId: session.authSession,
    codeChallenge: null,
    codeChallengeMethod: null,
    nonce: null,
  });

}

async function challengeUsernamePassword(session: LoginSession, username: string, password: string): Promise<User> {

  const principalService = new services.principal.PrincipalService('insecure');
  let user: Principal;
  let identity: PrincipalIdentity;
  try {
    identity = await services.principalIdentity.findByUri('mailto:' + username);
  } catch (err) {
    if (err instanceof NotFound) {
      throw new A12nLoginChallengeError(
        session,
        'Incorrect username or password',
        'username-password',
        true
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
        'username-password',
        true
      );
    } else {
      throw err;
    }
  }

  if (user.type !== 'user') {
    throw new A12nLoginChallengeError(
      session,
      'Credentials are not associated with a user',
      'username-password',
      true,
    );
  }

  if (!await services.user.validatePassword(user, password)) {
    throw new A12nLoginChallengeError(
      session,
      'Incorrect username or password',
      'username-password',
      true,
    );
  }

  session.principalId = user.id;
  session.passwordValid = true;
  session.dirty = true;

  if (!user.active) {

    throw new A12nLoginChallengeError(
      session,
      'This account is not active. Please contact support',
      'activate',
      false,
    );
  }
  if (identity.verifiedAt === null) {
    throw new A12nLoginChallengeError(
      session,
      'Email is not verified',
      'verify-email',
      true
    );
  }
  return user;
}


type ChallengeType =
  | 'username-password' // We want a username and password
  | 'activate' // Account is inactive. There's nothing the user can do.
  | 'verify-email' // We recognized the email address, but it was never verified

class A12nLoginChallengeError extends OAuth2Error {

  httpStatus = 400;
  errorCode = 'a12n_login_challenge';

  session: LoginSession;
  userChallenge: ChallengeType;
  wasFail: boolean;

  constructor(session: LoginSession, message: string, userChallenge: ChallengeType, wasFail: boolean) {

    super(message);
    this.userChallenge = userChallenge;
    this.wasFail = wasFail;
    this.session = session;

  }

  serializeErrorBody() {

    return {
      error: this.errorCode,
      error_description: this.message,
      challenge: this.userChallenge,
      was_fail: this.wasFail,
      auth_session: this.session.authSession,
      expires_at: this.session.expiresAt,
    };

  }



}

function assertSessionStage2(session: LoginSession): asserts session is LoginSessionStage2 {

  if (!session.principalId) {
    throw new Error('Invalid state: missing principalId');
  }
  if (!session.passwordValid) {
    throw new Error('Invalid state: passwordValid was false');
  }

}


