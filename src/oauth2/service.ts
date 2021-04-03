import { NotFound } from '@curveball/http-errors';
import * as crypto from 'crypto';
import db from '../database';
import { getSetting } from '../server-settings';
import * as userService from '../user/service';
import { User, App, Principal } from '../user/types';
import { InvalidGrant, InvalidRequest, UnauthorizedClient } from './errors';
import { CodeChallengeMethod, OAuth2Code, OAuth2Token } from './types';
import { OAuth2Client } from '../oauth2-client/types';
import { generateSecretToken } from '../crypto';

export async function getRedirectUris(client: OAuth2Client): Promise<string[]> {

  const query = 'SELECT uri FROM oauth2_redirect_uris WHERE oauth2_client_id = ?';
  const result = await db.query(query, [client.id]);

  return result[0].map((record: {uri:string}) => record.uri);

}

export async function validateRedirectUri(client: OAuth2Client, redirectUri: string): Promise<boolean> {

  const uris = await getRedirectUris(client);
  return uris.includes(redirectUri);

}

/**
 * Checks if a redirect_uri is permitted for the client.
 *
 * If not, it will emit an InvalidGrant error
 */
export async function requireRedirectUri(client: OAuth2Client, redirectUrl: string): Promise<void> {

  const uris = await getRedirectUris(client);
  if (uris.length===0) {
    throw new InvalidGrant('No valid redirect_uri was setup for this OAuth2 client_id');
  }
  if (!uris.includes(redirectUrl)) {
    throw new InvalidGrant(`Invalid value for redirect_uri. The redirect_uri you passed (${redirectUrl}) was not in the allowed list of redirect_uris`);
  }

}

export async function addRedirectUris(client: OAuth2Client, redirectUris: string[]): Promise<void> {

  const query = 'INSERT INTO oauth2_redirect_uris SET oauth2_client_id = ?, uri = ?';
  for(const uri of redirectUris) {
    await db.query(query, [client.id, uri]);
  }

}

export async function getActiveTokens(user: Principal): Promise<OAuth2Token[]> {

  const query = `
    SELECT
     oauth2_client_id,
     access_token,
     refresh_token,
     user_id,
     access_token_expires,
     refresh_token_expires,
     browser_session_id
    FROM oauth2_tokens
    WHERE 
      user_id = ?
    AND
      refresh_token_expires > UNIX_TIMESTAMP()
  `;

  const result = await db.query(query, [user.id]);

  return result[0].map((row: OAuth2TokenRecord):OAuth2Token => {
    return {
      accessToken: row.access_token,
      refreshToken: row.refresh_token,

      accessTokenExpires: row.access_token_expires,
      refreshTokenExpires: row.refresh_token_expires,
      tokenType: 'bearer',
      user: user,
      clientId: row.oauth2_client_id,
    };
  });

}

/**
 * This function is used for the implicit grant oauth2 flow.
 *
 * This function creates an access token for a specific user.
 */
export async function generateTokenForUser(client: OAuth2Client, user: Principal, browserSessionId?: string): Promise<OAuth2Token> {
  if (!user.active) {
    throw new Error ('Cannot generate token for inactive user');
  }
  const accessToken = await generateSecretToken();
  const refreshToken = await generateSecretToken();

  const query = 'INSERT INTO oauth2_tokens SET created = UNIX_TIMESTAMP(), ?';

  const expirySettings = getTokenExpiry();

  const accessTokenExpires = Math.floor(Date.now() / 1000) + expirySettings.accessToken;
  const refreshTokenExpires = Math.floor(Date.now() / 1000) + expirySettings.refreshToken;

  await db.query(query, {
    oauth2_client_id: client.id,
    access_token: accessToken,
    refresh_token: refreshToken,
    user_id: user.id,
    access_token_expires: accessTokenExpires,
    refresh_token_expires: refreshTokenExpires,
    browser_session_id: browserSessionId,
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpires,
    refreshTokenExpires,
    tokenType: 'bearer',
    user,
    clientId: client.id,
  };

}

/**
 * This function is used to create arbitrary access tokens, by the currently logged in user.
 *
 * There is no specific OAuth2 flow for this.
 */
export async function generateTokenForUserNoClient(user: User): Promise<Omit<OAuth2Token, 'clientId'>> {
  if (!user.active) {
    throw new Error ('Cannot generate token for inactive user');
  }
  const accessToken = await generateSecretToken();
  const refreshToken = await generateSecretToken();

  const query = 'INSERT INTO oauth2_tokens SET created = UNIX_TIMESTAMP(), ?';

  const expirySettings = getTokenExpiry();

  const accessTokenExpires = Math.floor(Date.now() / 1000) + expirySettings.accessToken;
  const refreshTokenExpires = Math.floor(Date.now() / 1000) + expirySettings.refreshToken;

  await db.query(query, {
    oauth2_client_id: 0,
    access_token: accessToken,
    refresh_token: refreshToken,
    user_id: user.id,
    access_token_expires: accessTokenExpires,
    refresh_token_expires: refreshTokenExpires,
    browser_session_id: null,
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpires,
    refreshTokenExpires,
    tokenType: 'bearer',
    user,
  };

}


/**
 * This function is used for the client_credentials oauth2 flow.
 *
 * In this flow there is not a 3rd party (resource owner). There is simply 2
 * clients talk to each other.
 *
 * The client acts on behalf of itself, not someone else.
 */
export async function generateTokenForClient(client: OAuth2Client): Promise<OAuth2Token> {

  const accessToken = await generateSecretToken();
  const refreshToken = await generateSecretToken();

  const query = 'INSERT INTO oauth2_tokens SET created = UNIX_TIMESTAMP(), ?';

  const expirySettings = getTokenExpiry();

  const accessTokenExpires = Math.floor(Date.now() / 1000) + expirySettings.accessToken;
  const refreshTokenExpires = Math.floor(Date.now() / 1000) + expirySettings.refreshToken;

  await db.query(query, {
    oauth2_client_id: client.id,
    access_token: accessToken,
    refresh_token: refreshToken,
    user_id: client.app.id,
    access_token_expires: accessTokenExpires,
    refresh_token_expires: refreshTokenExpires,
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpires,
    refreshTokenExpires,
    tokenType: 'bearer',
    user: client.app,
    clientId: client.id,
  };

}

/**
 * This function is used for the authorization_code oauth2 flow.
 *
 * In this flow a user first authenticates itself and grants permisssion to
 * the client. After gaining permission the user gets redirected back to the
 * resource owner with a one-time code.
 *
 * The resource owner then exchanges that code for an access and refresh token.
 */
export async function generateTokenFromCode(client: OAuth2Client, code: string, codeVerifier: string|undefined): Promise<OAuth2Token> {

  const query = 'SELECT * FROM oauth2_codes WHERE code = ?';
  const codeResult = await db.query(query, [code]);

  if (!codeResult[0].length) {
    throw new InvalidRequest('The supplied code was not recognized');
  }

  const codeRecord: OAuth2CodeRecord = codeResult[0][0];
  const expirySettings = getTokenExpiry();

  // Delete immediately.
  await db.query('DELETE FROM oauth2_codes WHERE id = ?', [codeRecord.id]);

  validatePKCE(codeVerifier, codeRecord.code_challenge, codeRecord.code_challenge_method);

  if (codeRecord.created + expirySettings.code < Math.floor(Date.now() / 1000)) {
    throw new InvalidRequest('The supplied code has expired');
  }
  if (codeRecord.client_id !== client.id) {
    throw new UnauthorizedClient('The client_id associated with the token did not match with the authenticated client credentials');
  }

  const user = await userService.findById(codeRecord.user_id) as User;
  return generateTokenForUser(client, user, codeRecord.browser_session_id || undefined);

}

export function validatePKCE(codeVerifier: string|undefined, codeChallenge: string|undefined, codeChallengeMethod: CodeChallengeMethod): void {
  if (!codeVerifier) {
    if (!codeChallenge) {
      // This request was not initiated with PKCE support, so ignore the validation
      return;
    } else {
      // The authorization request started with PKCE, but the token request did not follow through
      throw new InvalidRequest('The code verifier was not supplied');
    }
  }

  // For the plain method, the derived code and the code verifier are the same
  let derivedCodeChallenge = codeVerifier;

  if (codeChallengeMethod === 'S256') {
    derivedCodeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  if (codeChallenge !== derivedCodeChallenge) {
    throw new InvalidGrant('The code verifier does not match the code challenge');
  }

}

/**
 * This function is used for the 'refresh_token' grant.
 *
 * By specifying a refresh token, a new access/refresh token pair gets
 * returned. This also expires the old token.
 */
export async function generateTokenFromRefreshToken(client: OAuth2Client, refreshToken: string): Promise<OAuth2Token> {

  let oldToken: OAuth2Token;
  try {
    oldToken = await getTokenByRefreshToken(refreshToken);

  } catch (err) {
    if (err instanceof NotFound) {
      throw new InvalidGrant('The refresh token was not recognized');
    } else {
      throw err;
    }
  }
  if (oldToken.clientId !== client.id) {
    throw new UnauthorizedClient('The client_id associated with the refresh did not match with the authenticated client credentials');
  }

  await revokeToken(oldToken);
  return generateTokenForUser(client, oldToken.user, oldToken.browserSessionId);

}

export async function revokeByAccessRefreshToken(client: OAuth2Client, token: string): Promise<void> {

  let oauth2Token: OAuth2Token|null = null;

  try {
    oauth2Token = await getTokenByAccessToken(token);
  } catch (err) {
    if (err instanceof NotFound) {
      // Swallow since it's okay if the token has been revoked previously or is invalid (Section 2.2 of RFC7009)
    } else {
      throw err;
    }
  }

  if (!oauth2Token) {
    try {
      oauth2Token = await getTokenByRefreshToken(token);
    } catch (err) {
      if (err instanceof NotFound) {
        // Swallow since it's okay if the token has been revoked previously or is invalid (Section 2.2 of RFC7009)
      } else {
        throw err;
      }
    }
  }

  if (!oauth2Token) {
    return;
  }

  if (oauth2Token.clientId !== client.id) {
    // Treat this as an invalid token and don't do anything
    return;
  }

  await revokeToken(oauth2Token);

}

/**
 * Removes a token.
 *
 * This function will not throw an error if the token was deleted before.
 */
export async function revokeToken(token: OAuth2Token): Promise<void> {

  const query = 'DELETE FROM oauth2_tokens WHERE access_token = ?';
  await db.query(query, [token.accessToken]);

}

/**
 * This function is used for the authorization_code grant flow.
 *
 * This function creates an code for a user. The code is later exchanged for
 * a oauth2 access token.
 */
export async function generateCodeForUser(
  client: OAuth2Client,
  user: User,
  codeChallenge: string|undefined,
  codeChallengeMethod: string|undefined,
  browserSessionId: string,
): Promise<OAuth2Code> {

  const code = await generateSecretToken();

  const query = 'INSERT INTO oauth2_codes SET created = UNIX_TIMESTAMP(), ?';

  await db.query(query, {
    client_id: client.id,
    user_id: user.id,
    code: code,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    browser_session_id: browserSessionId,
  });

  return {
    code: code
  };

}

type OAuth2TokenRecord = {
  oauth2_client_id: number,
  access_token: string,
  refresh_token: string,
  user_id: number,
  access_token_expires: number,
  refresh_token_expires: number
  browser_session_id: string | null,
};

type OAuth2CodeRecord = {
  id: number,
  client_id: number,
  code: string,
  user_id: number,
  code_challenge: string|undefined,
  code_challenge_method: CodeChallengeMethod
  created: number,
  browser_session_id: string | null,
};

/**
 * Returns Token information for an existing Access Token.
 *
 * This effectively gives you all information of an access token if you have
 * just the bearer, and allows you to validate if a bearer token is valid.
 *
 * This function will throw NotFound if the token was not recognized.
 */
export async function getTokenByAccessToken(accessToken: string): Promise<OAuth2Token> {

  const query = `
  SELECT
   oauth2_client_id,
   access_token,
   refresh_token,
   user_id,
   access_token_expires,
   refresh_token_expires,
   browser_session_id
  FROM oauth2_tokens
  WHERE
    access_token = ? AND
    access_token_expires > UNIX_TIMESTAMP()
  `;

  const result = await db.query(query, [accessToken]);
  if (!result[0].length) {
    throw new NotFound('Access token not recognized');
  }

  const row: OAuth2TokenRecord = result[0][0];
  const user = await userService.findActiveById(row.user_id);

  return {
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    accessTokenExpires: row.access_token_expires,
    refreshTokenExpires: row.refresh_token_expires,
    tokenType: 'bearer',
    user: user as App | User,
    clientId: row.oauth2_client_id,
    browserSessionId: row.browser_session_id || undefined,
  };

}

/**
 * Returns Token information for an existing Refresh Token.
 *
 * This function will throw NotFound if the token was not recognized.
 */
export async function getTokenByRefreshToken(refreshToken: string): Promise<OAuth2Token> {

  const query = `
  SELECT
   oauth2_client_id,
   access_token,
   refresh_token,
   user_id,
   access_token_expires,
   refresh_token_expires,
   browser_session_id
  FROM oauth2_tokens
  WHERE
    refresh_token = ? AND
    refresh_token_expires > UNIX_TIMESTAMP()
  `;

  const result = await db.query(query, [refreshToken]);
  if (!result[0].length) {
    throw new NotFound('Refresh token not recognized');
  }

  const row: OAuth2TokenRecord = result[0][0];

  const user = await userService.findActiveById(row.user_id);

  return {
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    accessTokenExpires: row.access_token_expires,
    refreshTokenExpires: row.refresh_token_expires,
    tokenType: 'bearer',
    user: user as App | User,
    clientId: row.oauth2_client_id,
    browserSessionId: row.browser_session_id || undefined,
  };

}

/**
 * Removes all tokens that relate to a specific browser session id.
 *
 * This will cause all access tokens and refresh tokens to be invalidated. Generally
 * used when a user logs out.
 *
 * This doesn't remove all tokens for all sessions, but should remove the tokens that
 * relate to the device the user used to log out.
 */
export async function invalidateTokensByBrowserSessionId(browserSessionId: string) {

  await db.query('DELETE FROM oauth2_codes WHERE browser_session_id = ?', browserSessionId);
  await db.query('DELETE FROM oauth2_tokens WHERE browser_session_id = ?', browserSessionId);

}

type TokenExpiry = {
  accessToken: number,
  refreshToken: number,
  code: number,
};

function getTokenExpiry(): TokenExpiry {

  return {
    accessToken: getSetting('oauth2.accessToken.expiry', 600),
    refreshToken: getSetting('oauth2.refreshToken.expiry', 3600 * 6),
    code: getSetting('oauth2.code.expiry', 600),
  };

}
