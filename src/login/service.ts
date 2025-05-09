import { BadRequest, NotFound } from '@curveball/http-errors';
import { LoginSession } from './types.ts';
import { AuthorizationChallengeRequest } from '../api-types.ts';
import { InvalidGrant } from '../oauth2/errors.ts';
import { OAuth2Code } from '../oauth2/types.ts';
import * as services from '../services.ts';
import { AppClient, PrincipalIdentity, User } from '../types.ts';
import { getLogger } from '../log/service.ts';
import { generateSecretToken } from '../crypto.ts';
import { LoginChallengePassword } from './challenge/password.ts';
import { LoginChallengeTotp } from './challenge/totp.ts';
import { LoginChallengeEmailOtp } from './challenge/email-otp.ts';
import { A12nLoginChallengeError } from './error.ts';
import { AbstractLoginChallenge } from './challenge/abstract.ts';
import { UserEventLogger } from '../log/types.ts';
import { LoginChallengeEmailVerification } from './challenge/email-verification.ts';

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
    username: null,
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

  // If set to true, the session will be deleted instead of stored
  let success = false;

  try {

    const {
      principal,
      identity,
      log,
    } = await initChallengeContext(
      session,
      parameters
    );
    session.principalId = principal.id;
    session.principalIdentityId = identity.id;
    session.username = parameters.username ?? null;

    if (logSessionStart) log('login-challenge-started');

    const challenges = await getChallengesForPrincipal(principal, identity, log, parameters.remote_addr!);

    if (challenges.length === 0) {
      throw new A12nLoginChallengeError(
        'This user exists but has no credentials set up in their account',
        'no_credentials',
      );

    }

    for(const challenge of challenges) {
      if (session.challengesCompleted.includes(challenge.authFactor)) {
        // This challenge has already been checked previously.
        continue;
      }
      if (challenge.parametersContainsResponse(parameters)) {
        // The user did submit a value for this challenge. Lets check it.
        const challengeResult = await challenge.checkResponse(parameters);
        if (challengeResult) {
          // Challenge passed.
          session.challengesCompleted.push(challenge.authFactor);
        }
      }

    }

    const completedChallenges = new Set(session.challengesCompleted);

    if ((completedChallenges.size < 2 && challenges.length > 1) || completedChallenges.size < 1) {
      // If there are 2 or more auth factors set up, we want at least 2 successful
      // passes. If this is not the case we're going to emit a challenge error.
      for(const challenge of challenges) {
        if (!session.challengesCompleted.includes(challenge.authFactor)) {
          await challenge.challenge();
        }
      }
    }

    log('login-challenge-success');
    success = true;
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

  } catch (err) {

    if (err instanceof A12nLoginChallengeError) {
      err.session = session;
    }
    throw err;

  } finally {

    if (success) {
      await deleteSession(session);
    } else {
      await storeSession(session);
    }

  }

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
  const ps = new services.principal.PrincipalService('insecure');
  if (session.principalIdentityId && session.principalId) {

    principal = await ps.findById(session.principalId);
    identity = await services.principalIdentity.findById(principal, session.principalIdentityId);
  } else {
    if (parameters.username === undefined) {
      throw new A12nLoginChallengeError(
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
          'Incorrect username or password',
          'username_or_password_invalid',
        );
      } else {
        throw err;
      }
    }
  }
  if (principal.type !== 'user') {
    throw new A12nLoginChallengeError(
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
      'This account is not active. Please contact support',
      'account_not_active',
    );
  }
  return {
    principal,
    identity,
    log,
  };

}

/**
 * Returns the full list of login challenges the user has setup up.
 */
async function getChallengesForPrincipal(principal: User, identity: PrincipalIdentity,log: UserEventLogger, ip: string): Promise<AbstractLoginChallenge<unknown>[]> {

  const challenges = [
    new LoginChallengePassword(principal, identity, log, ip),
    new LoginChallengeEmailVerification(principal, identity, log, ip),
    new LoginChallengeTotp(principal, identity, log, ip),
    new LoginChallengeEmailOtp(principal, identity, log, ip),
  ];

  const result = [];
  for(const challenge of challenges) {
    if (await challenge.userHasChallenge()) {
      result.push(challenge);
    }
  }
  return result;

}
