import { NotFound } from '@curveball/http-errors';
import * as crypto from 'crypto';
import db, { query } from '../database';
import { getSetting } from '../server-settings';
import * as principalService from '../principal/service';
import { User, App } from '../principal/types';
import { InvalidGrant, InvalidRequest, UnauthorizedClient } from './errors';
import { CodeChallengeMethod, OAuth2Code, OAuth2Token } from './types';
import { OAuth2Client } from '../oauth2-client/types';
import { generateSecretToken } from '../crypto';
import { generateJWTAccessToken } from './jwt';
import { Oauth2TokensRecord, Oauth2CodesRecord } from 'knex/types/tables';
import { GrantType } from '../types';

const oauth2TokenFields: (keyof Oauth2TokensRecord)[] = [
  'id',
  'oauth2_client_id',
  'access_token',
  'refresh_token',
  'user_id',
  'access_token_expires',
  'refresh_token_expires',
  'created_at',
  'browser_session_id',
  'scope',
  'grant_type',
];

export async function getRedirectUris(client: OAuth2Client): Promise<string[]> {

  const result = await query(
    'SELECT uri FROM oauth2_redirect_uris WHERE oauth2_client_id = ?',
    [client.id]
  );

  return result.map((record: {uri:string}) => record.uri);

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

  const query = 'INSERT INTO oauth2_redirect_uris (oauth2_client_id, uri) VALUES (?, ?)';
  for(const uri of redirectUris) {
    await db.raw(query, [client.id, uri]);
  }

}

export async function getActiveTokens(user: App | User): Promise<OAuth2Token[]> {

  const result = await db('oauth2_tokens')
    .select(oauth2TokenFields)
    .where('user_id', user.id)
    .andWhere('refresh_token_expires', '>', Math.floor(Date.now()/1000));

  return result.map(row => tokenRecordToModel(row, user));

}

type GenerateTokenImplicitOptions = {
  client: OAuth2Client;
  principal: User;
  scope: string[] | null;
  browserSessionId: string;
}

/**
 * Generates a token for the 'implicit' GrantType
 */
export function generateTokenImplicit(options: GenerateTokenImplicitOptions): Promise<OAuth2Token> {
  return generateTokenInternal({
    grantType: 'implicit',
    secretUsed: false,
    ...options,
  });
}

type GenerateTokenClientCredentialsOptions = {
  client: OAuth2Client;
  scope: string[] | null;
}

/**
 * Generates a token for the 'implicit' GrantType
 */
export function generateTokenClientCredentials(options: GenerateTokenClientCredentialsOptions): Promise<OAuth2Token> {
  return generateTokenInternal({
    grantType: 'client_credentials',
    principal: options.client.app,
    secretUsed: true,
    ...options,
  });
}

type GenerateTokenPasswordOptions = {
  client: OAuth2Client;
  principal: User;
  scope: string[] | null;
}
/**
 * Generates a token for the 'implicit' GrantType
 */
export function generateTokenPassword(options: GenerateTokenPasswordOptions): Promise<OAuth2Token> {
  return generateTokenInternal({
    grantType: 'password',
    ...options,
    secretUsed: true,
  });
}

type GenerateTokenAuthorizationCodeOptions = {
  client: OAuth2Client;
  code: string;
  codeVerifier?: string;
  secretUsed: boolean;
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
export async function generateTokenAuthorizationCode(options: GenerateTokenAuthorizationCodeOptions): Promise<OAuth2Token> {

  const codeResult = await db<Oauth2CodesRecord>('oauth2_codes')
    .first()
    .where({code: options.code});

  if (!codeResult) {
    throw new InvalidRequest('The supplied code was not recognized');
  }

  const codeRecord = codeResult;
  const expirySettings = getTokenExpiry();

  await db('oauth2_codes')
    .delete()
    .where({code: codeRecord.code});

  // Delete immediately.
  await db.raw('DELETE FROM oauth2_codes WHERE id = ?', [codeRecord.id]);

  validatePKCE(
    options.codeVerifier,
    codeRecord.code_challenge ?? undefined,
    codeRecord.code_challenge_method ?? 'S256',
  );

  if (codeRecord.created_at + expirySettings.code < Math.floor(Date.now() / 1000)) {
    throw new InvalidRequest('The supplied code has expired');
  }
  if (codeRecord.client_id !== options.client.id) {
    throw new UnauthorizedClient('The client_id associated with the token did not match with the authenticated client credentials');
  }

  const user = await principalService.findById(codeRecord.principal_id, 'user');
  if (!user.active) {
    throw new Error(`User ${user.href} is not active`);
  }
  return generateTokenInternal({
    grantType: 'authorization_code',
    principal: user,
    scope: codeRecord.scope?.split(' ') || null,
    ...options,
  });

}

type GenerateTokenDeveloperTokenOptions = {
  principal: User;
}
/**
 * Generates a token for the 'implicit' GrantType
 */
export function generateTokenDeveloperToken(options: GenerateTokenDeveloperTokenOptions): Promise<OAuth2Token> {
  const client: OAuth2Client = {
    id: 0,
    clientId: 'system',
    clientSecret: '',
    allowedGrantTypes: [],
    requirePkce: false,
    href: '/system/client',
    app: {
      id: 0,
      href:'/system',
      externalId: 'system',
      identity: 'https://curveballjs.org/a12nserver',
      createdAt: new Date('2018-11-01T140000Z'),
      modifiedAt: new Date('2022-09-11T020000Z'),
      type: 'app',
      nickname: 'a12n-server system user',
      active: true,
    }
  };
  return generateTokenInternal({
    grantType: 'developer-token',
    ...options,
    secretUsed: false,
    client,
    scope: null,
  });
}

type GenerateTokenOneTimeTokenOptions = {
  client: OAuth2Client;
  principal: User;
}
/**
 * Generates a token for the 'implicit' GrantType
 */
export function generateTokenOneTimeToken(options: GenerateTokenOneTimeTokenOptions): Promise<OAuth2Token> {
  return generateTokenInternal({
    grantType: 'developer-token',
    ...options,
    secretUsed: false,
    scope: null,
  });
}

type GenerateTokenOptions = {

  /**
   * The `null` case should be removed from a future version. This is
   * supported because we used to not store grant_type, and we want to be able
   * to refresh those old tokens.
   *
   * Goal is to remove this Summer 2023
   */
  grantType: GrantType | null;
  client: OAuth2Client;
  principal: App |User;
  scope: string[] | null;
  browserSessionId?: string;
  secretUsed: boolean;
}

/**
 * Don't export this function, use or write a more specific function for each grantType
 */
async function generateTokenInternal(options: GenerateTokenOptions): Promise<OAuth2Token> {

  if (!options.principal.active) {
    throw new Error ('Cannot generate token for inactive user');
  }

  const expirySettings = getTokenExpiry();
  const accessTokenExpires = Math.floor(Date.now() / 1000) + expirySettings.accessToken;
  const refreshTokenExpires = Math.floor(Date.now() / 1000) + expirySettings.refreshToken;

  let accessToken: string;

  if (getSetting('jwt.privateKey')!==null && options.client) {
    accessToken = await generateJWTAccessToken(
      options.principal,
      options.client,
      expirySettings.accessToken,
      []
    );
  } else {
    accessToken = await generateSecretToken();
  }
  const refreshToken = await generateSecretToken();

  const record: Omit<Oauth2TokensRecord, 'id'> = {
    oauth2_client_id: options.client?.id || 0,
    access_token: accessToken,
    refresh_token: refreshToken,
    user_id: options.principal.id,
    grant_type: grantTypeId(options.grantType, options.secretUsed),
    scope: options.scope?.join(' ') ?? null,
    access_token_expires: accessTokenExpires,
    refresh_token_expires: refreshTokenExpires,
    browser_session_id: options.browserSessionId || null,
    created_at: Math.trunc(Date.now() / 1000),
  };

  await db('oauth2_tokens').insert(record);

  return {
    accessToken,
    refreshToken,
    grantType: 'implicit',
    secretUsed: false,
    accessTokenExpires,
    refreshTokenExpires,
    tokenType: 'bearer',
    principal: options.principal,
    clientId: options.client.id,
    scope: options.scope,
  };

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

  return generateTokenInternal({
    grantType: oldToken.grantType,
    principal: oldToken.principal,
    client,
    scope: oldToken.scope,
    secretUsed: oldToken.secretUsed,
  });

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
  await db.raw(query, [token.accessToken]);

}

type GenerateAuthorizationCodeOptions = {
  client: OAuth2Client;
  principal: User;
  scope: string[] | null;
  codeChallenge: string|undefined;
  codeChallengeMethod: CodeChallengeMethod|undefined;
  browserSessionId: string;
}
/**
 * This function is used for the authorization_code grant flow.
 *
 * This function creates an code for a user. The code is later exchanged for
 * a oauth2 access token.
 */
export async function generateAuthorizationCode(options: GenerateAuthorizationCodeOptions): Promise<OAuth2Code> {

  const code = await generateSecretToken();
  await db('oauth2_codes')
    .insert({
      client_id: options.client.id,
      principal_id: options.principal.id,
      code: code,
      code_challenge: options.codeChallenge,
      code_challenge_method: options.codeChallengeMethod,
      scope: options.scope?.join(' '),
      browser_session_id: options.browserSessionId,
      created_at: Math.floor(Date.now() / 1000),
    });

  return {
    code: code
  };

}

/**
 * Returns Token information for an existing Access Token.
 *
 * This effectively gives you all information of an access token if you have
 * just the bearer, and allows you to validate if a bearer token is valid.
 *
 * This function will throw NotFound if the token was not recognized.
 */
export async function getTokenByAccessToken(accessToken: string): Promise<OAuth2Token> {

  const result = await db('oauth2_tokens')
    .select(oauth2TokenFields)
    .where('access_token', accessToken)
    .andWhere('access_token_expires', '>', Date.now() / 1000);

  if (!result.length) {
    throw new NotFound('Access token not recognized');
  }

  const row: Oauth2TokensRecord = result[0];
  const principal = await principalService.findById(row.user_id);

  if (!principal.active) {
    throw new Error(`Principal ${principal.href} is not active`);
  }

  return tokenRecordToModel(
    row,
    principal as App | User,
  );
}

/**
 * Returns Token information for an existing Refresh Token.
 *
 * This function will throw NotFound if the token was not recognized.
 */
export async function getTokenByRefreshToken(refreshToken: string): Promise<OAuth2Token> {

  const result = await db('oauth2_tokens')
    .select(oauth2TokenFields)
    .where('refresh_token', refreshToken)
    .andWhere('refresh_token_expires', '>', Date.now() / 1000);

  if (!result.length) {
    throw new NotFound('Refresh token not recognized');
  }

  const row = result[0];

  const principal = await principalService.findById(row.user_id);
  if (!principal.active) {
    throw new Error(`Principal ${principal.href} is not active`);
  }

  return tokenRecordToModel(row, principal as App|User);

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

  await db.raw('DELETE FROM oauth2_codes WHERE browser_session_id = ?', [browserSessionId]);
  await db.raw('DELETE FROM oauth2_tokens WHERE browser_session_id = ?', [browserSessionId]);

}

type TokenExpiry = {
  accessToken: number;
  refreshToken: number;
  code: number;
};

function getTokenExpiry(): TokenExpiry {

  return {
    accessToken: getSetting('oauth2.accessToken.expiry'),
    refreshToken: getSetting('oauth2.refreshToken.expiry'),
    code: getSetting('oauth2.code.expiry'),
  };

}

export async function lastTokenId(): Promise<number> {

  const result = await db('oauth2_tokens')
    .first('id')
    .orderBy('id', 'DESC');

  return result?.id || 0;

}

function tokenRecordToModel(token: Oauth2TokensRecord, principal: User | App): OAuth2Token {

  const [grantType, secretUsed] = grantTypeIdInfo(token.grant_type);

  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,

    accessTokenExpires: token.access_token_expires,
    refreshTokenExpires: token.refresh_token_expires,
    tokenType: 'bearer',
    grantType,
    secretUsed,

    scope: token.scope?.split(' ') ?? null,

    principal,
    clientId: token.oauth2_client_id,

  };
}

function grantTypeIdInfo(grantType: number|null): [Exclude<GrantType, 'refresh_token'>|null, boolean] {

  switch(grantType) {
    case null: return [null, false];
    case 1: return ['implicit', false];
    case 2: return ['client_credentials', true];
    case 3: return ['password', true];
    case 4: return ['authorization_code', false];
    case 5: return ['authorization_code', true];
    case 6: return ['one-time-token', false];
    case 7: return ['developer-token', false];
    default:
      throw new Error('Unknown grant_type in database');
  }

}

function grantTypeId(grantType: 'authorization_code', secretUsed: boolean): number;
function grantTypeId(grantType: GrantType | null, secretUsed?: boolean): null;
function grantTypeId(grantType: GrantType | null, secretUsed?: boolean): number | null {

  switch(grantType) {
    case null:
      return null;
    case 'implicit':
      return 1;
    case 'client_credentials':
      return 2;
    case 'password':
      return 3;
    case 'authorization_code' :
      return secretUsed ? 5 : 4;
    case 'refresh_token' :
      throw new Error(`Incorrect grantType for a token: ${grantType}. The token must be stored with the original grant_type`);
    case 'one-time-token' :
      return 6;
    case 'developer-token' :
      return 7;

  }

}
