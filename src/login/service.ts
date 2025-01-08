import { BadRequest, NotFound } from '@curveball/http-errors';
import { LoginSession } from './types.js';
import { AuthorizationChallengeRequest } from '../api-types.js';
import { InvalidGrant } from '../oauth2/errors.js';
import { OAuth2Code } from '../oauth2/types.js';
import * as services from '../services.js';
import { AppClient, User } from '../types.js';
import { getLogger } from '../log/service.js';
import { generateSecretToken } from '../crypto.js';
import { LoginChallengePassword } from './challenge/password.js';
import { LoginChallengeTotp } from './challenge/totp.js';
import { A12nLoginChallengeError } from './error.js';
import { AbstractLoginChallenge } from './challenge/abstract.js';
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

  const id: string = await generateSecretToken();

  return {
    authSession: id,
    appClientId: client.id,
    expiresAt: Math.floor(Date.now() / 1000) + LOGIN_SESSION_EXPIRY,
    principalId: null,
    principalIdentityId: null,
    challengesCompleted: [],
    scope,
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

  // If the session doesn't already have a principalId, we must log a 'session start'
  // event.
  const logSessionStart = !session.principalId;

  let {
    principal,
    identity,
    dirty,
    log,
  } = await initChallengeContext(
    session,
    parameters
  );
  session.principalId = principal.id;
  session.principalIdentityId = identity.id;

  if (logSessionStart) log('login-challenge-started');

  const challenges = await getChallengesForPrincipal(principal, log);

  if (challenges.length === 0) {
    throw new A12nLoginChallengeError(
      session,
      'This user exists but has no credentials set up in their account',
      'no_credentials',
    );

  }

  try {

    for(const challenge of challenges) {
      if (session.challengesCompleted.includes(challenge.authFactor)) {
        // This challenge has already been checked previously.
        continue;
      }
      if (challenge.parametersContainsResponse(parameters)) {
        // The user did submit a value for this challenge. Lets check it.
        const challengeResult = await challenge.checkResponse(session, parameters);
        if (challengeResult) {
          // Challenge passed.
          session.challengesCompleted.push(challenge.authFactor);
          dirty = true;
        }
      }

    }

    const completedChallenges = new Set(session.challengesCompleted);

    if (completedChallenges.size < 2 && challenges.length > 1) {
      // If there are 2 or more auth factors set up, we want at least 2 successful
      // passes. If this is not the case we're going to emit a challenge error.
      for(const challenge of challenges) {
        if (!session.challengesCompleted.includes(challenge.authFactor)) {
          challenge.challenge(session);
        }
      }
    }

    log('login-challenge-success');

  } finally {

    if (dirty) {
      await storeSession(session);
      dirty = false;
    }

  }

  await deleteSession(session);

  return await services.oauth2.generateAuthorizationCode({
    client,
    principal,
    scope: session.scope ?? [],
    redirectUri: null,
    grantType: 'authorization_challenge',
    browserSessionId: session.authSession,
    codeChallenge: null,
    codeChallengeMethod: null,
    nonce: null,
  });

}

function sessionKey(id: string): string {

  return 'a12n:authorization_challenge:session:' + id;

}

async function continueLoginSession(client: AppClient, authSession: string): Promise<LoginSession> {

  const session = await services.kv.get<LoginSession>(
    sessionKey(authSession)
  );

  if (session === null) {
    throw new InvalidGrant('Invalid auth_session');
  }

  if (session.appClientId != client.id) {
    throw new InvalidGrant('The client you authenticated with did not start this login session');
  }

  return session;

}

async function storeSession(session: LoginSession) {

  await services.kv.set(
    sessionKey(session.authSession),
    session,
    {
      ttl: session.expiresAt * 1000 - Date.now(),
    }
  );

}
async function deleteSession(session: LoginSession) {

  await services.kv.del(sessionKey(session.authSession));

}

async function initChallengeContext(session: LoginSession, parameters: ChallengeRequest) {

  let principal;
  let identity;
  let dirty = false;
  const ps = new services.principal.PrincipalService('insecure');
  if (session.principalIdentityId && session.principalId) {

    principal = await ps.findById(session.principalId);
    identity = await services.principalIdentity.findById(principal, session.principalIdentityId);
  } else {
    if (parameters.username === undefined) {
      throw new A12nLoginChallengeError(
        session,
        'A username is required',
        'username_required',
      );
    }
    try {
      identity = await services.principalIdentity.findByUri('mailto:' + parameters.username);
      principal = identity.principal;

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
    dirty = true;
  }
  if (principal.type !== 'user') {
    throw new A12nLoginChallengeError(
      session,
      'Credentials are not associated with a user',
      'not_a_user',
    );
  }
  const log = getLogger(
    principal,
    parameters.remote_addr ?? null,
    parameters.user_agent ?? null
  );
  if (!principal.active) {
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
  return {
    principal,
    identity,
    log,
    dirty,
  };

}

/**
 * Returns the full list of login challenges the user has setup up.
 */
async function getChallengesForPrincipal(principal: User, log: UserEventLogger): Promise<AbstractLoginChallenge<unknown>[]> {

  const challenges = [
    new LoginChallengePassword(principal, log),
    new LoginChallengeTotp(principal, log)
  ];

  const result = [];
  for(const challenge of challenges) {
    if (await challenge.userHasChallenge()) {
      result.push(challenge);
    }
  }
  return result;

}
