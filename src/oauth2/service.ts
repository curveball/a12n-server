import { NotFound } from '@curveball/http-errors';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '../database';
import * as UserService from '../user/service';
import { User } from '../user/types';
import { InvalidGrant, InvalidRequest, UnauthorizedClient} from './errors';
import { OAuth2Client, OAuth2Code, OAuth2Token } from './types';
import { getSetting } from '../server-settings';

export async function getClientByClientId(clientId: string): Promise<OAuth2Client> {

  const query = 'SELECT id, client_id, client_secret, user_id, allowed_grant_types FROM oauth2_clients WHERE client_id = ?';
  const result = await db.query(query, [clientId]);

  if (!result[0].length) {
    throw new NotFound('OAuth2 client_id not recognized');
  }

  return {
    id: result[0][0].id,
    clientId: result[0][0].client_id,
    clientSecret: result[0][0].client_secret,
    userId: result[0][0].user_id,
    allowedGrantTypes: result[0][0].allowed_grant_types.split(' '),
  };

}

export async function validateSecret(oauth2Client: OAuth2Client, secret: string): Promise<boolean> {

  return await bcrypt.compare(secret, oauth2Client.clientSecret.toString('utf-8'));

}

export async function validateRedirectUri(client: OAuth2Client, redirectUrl: string) {

  const query = 'SELECT id FROM oauth2_redirect_uris WHERE oauth2_client_id = ? AND uri = ?';
  const result = await db.query(query, [client.id, redirectUrl]);

  return result[0].length > 0;

}

/**
 * This function is used for the implicit grant oauth2 flow.
 *
 * This function creates an access token for a specific user.
 */
export async function generateTokenForUser(client: OAuth2Client, user: User): Promise<OAuth2Token> {
  if (!user.active) {
    throw new Error ('Cannot generate token for inactive user');
  }
  const accessToken = crypto.randomBytes(32).toString('base64').replace('=', '');
  const refreshToken = crypto.randomBytes(32).toString('base64').replace('=', '');

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
  });

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    accessTokenExpires: accessTokenExpires,
    tokenType: 'bearer',
    userId: user.id,
    clientId: client.id,
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

  const accessToken = crypto.randomBytes(32).toString('base64').replace('=', '');
  const refreshToken = crypto.randomBytes(32).toString('base64').replace('=', '');

  const query = 'INSERT INTO oauth2_tokens SET created = UNIX_TIMESTAMP(), ?';

  const expirySettings = getTokenExpiry();

  const accessTokenExpires = Math.floor(Date.now() / 1000) + expirySettings.accessToken;
  const refreshTokenExpires = Math.floor(Date.now() / 1000) + expirySettings.refreshToken;

  await db.query(query, {
    oauth2_client_id: client.id,
    access_token: accessToken,
    refresh_token: refreshToken,
    user_id: client.userId,
    access_token_expires: accessTokenExpires,
    refresh_token_expires: refreshTokenExpires,
  });

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    accessTokenExpires: accessTokenExpires,
    tokenType: 'bearer',
    userId: client.userId,
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
export async function generateTokenFromCode(client: OAuth2Client, code: string): Promise<OAuth2Token> {

  const query = 'SELECT * FROM oauth2_codes WHERE code = ?';
  const codeResult = await db.query(query, [code]);

  if (!codeResult[0].length) {
    throw new InvalidRequest('The supplied code was not recognized');
  }

  const codeRecord: OAuth2CodeRecord = codeResult[0][0];
  const expirySettings = getTokenExpiry();

  // Delete immediately.
  await db.query('DELETE FROM oauth2_codes WHERE id = ?', [codeRecord.id]);

  if (codeRecord.created + expirySettings.code < Math.floor(Date.now() / 1000)) {
    throw new InvalidRequest('The supplied code has expired');
  }
  if (codeRecord.client_id !== client.id) {
    throw new UnauthorizedClient('The client_id associated with the token did not match with the authenticated client credentials');
  }

  const user = await UserService.findById(codeRecord.user_id);
  return generateTokenForUser(client, user);

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
  const user = await UserService.findById(oldToken.userId);
  return generateTokenForUser(client, user);

}

/**
 * Removes a token.
 *
 * This function will not throw an error if the token was deleted before.
 */
export async function revokeToken(token: OAuth2Token) {

  const query = 'DELETE FROM oauth2_tokens WHERE access_token = ?';
  await db.query(query, [token.accessToken]);

}

/**
 * This function is used for the authorization_code grant flow.
 *
 * This function creates an code for a user. The code is later exchanged for
 * a oauth2 access token.
 */
export async function generateCodeForUser(client: OAuth2Client, user: User): Promise<OAuth2Code> {

  const code = crypto.randomBytes(32).toString('base64').replace('=', '');

  const query = 'INSERT INTO oauth2_codes SET created = UNIX_TIMESTAMP(), ?';

  await db.query(query, {
    client_id: client.id,
    user_id: user.id,
    code: code,
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
};

type OAuth2CodeRecord = {
  id: number,
  client_id: number,
  code: string,
  user_id: number,
  created: number,
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
   refresh_token_expires
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
  return {
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    accessTokenExpires: row.access_token_expires,
    tokenType: 'bearer',
    userId: row.user_id,
    clientId: row.oauth2_client_id,
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
   refresh_token_expires
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
  return {
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    accessTokenExpires: row.access_token_expires,
    tokenType: 'bearer',
    userId: row.user_id,
    clientId: row.oauth2_client_id,
  };

}

type TokenExpiry = {
  accessToken: number,
  refreshToken: number,
  code: number,
};

function getTokenExpiry(): TokenExpiry {

  return {
    accessToken: getSetting('oauth2.accessToken.expiry', 600),
    refreshToken: getSetting('oauth2.refreshToken.expiry', 3600*6),
    code: getSetting('oauth2.code.expiry', 600),
  };

}
