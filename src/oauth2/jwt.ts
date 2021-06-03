import { User, App } from '../principal/types';
import { OAuth2Client } from '../oauth2-client/types';
import { generateSecretToken } from '../crypto';
import * as jwt from 'jsonwebtoken';
import { resolve } from 'url';
import { getSetting } from '../server-settings';

type JwtAccessToken = {

  /**
   e Issuer.
   *
   * This will be URI pointing to the a12nserver instance
   */
  iss: string;

  /**
   * Expires, unix timestamp
   */
  exp: number;

  /**
   * Audience.
   *
   * Who requested the token? Usually the uri of the resource server.
   */
  aud: string;

  /**
   * Subject.
   *
   * This refers to the 'resource owner' of the token, so usually the end-user that's logged in.
   */
  sub: string;

  /**
   * OAuth2 client_id
   */
  client_id: string;

  /**
   * Issue time, unix timestamp
   */
  iat: number;

  /**
   * A unique id for this token, to prevent replay attacks
   */
  jti: string;

  /**
   * Space-separated list of scopes
   */
  scope: string;

}

export async function generateJWTAccessToken(user: User|App, client: OAuth2Client, expiry: number, scopes: string[]): Promise<string> {

  const jwtPrivateKey = getSetting('jwt.privateKey');
  if (!jwtPrivateKey) {
    throw new Error('The JWT_PRIVATE_KEY environment variable must be set, and must be a RSA private key file (typically a .pem file)');
  }

  const origin = process.env.PUBLIC_URI!;
  const jti = await generateSecretToken();

  // Some environment variable systems will convert the newline to a literal '\n'.
  // this is a safe operation, because the file should not contain any literal
  // backslashes.
  const privateKey = jwtPrivateKey.replace(/\\n/gm, '\n');

  const jwtBody: JwtAccessToken = {
    iss: origin,
    exp: Math.floor(Date.now() / 1000) + expiry,
    aud:  resolve(origin, '/app/' + client.app.id),
    sub: resolve(origin, '/user/' + user.id),
    client_id: client.clientId,
    iat: Math.floor(Date.now() / 1000),
    jti,
    scope: scopes.join(' '),
  };

  const jwtOptions = {
    algorithm: 'RS256' as const,
  };

  return new Promise<string>((res, rej) => {
    jwt.sign(jwtBody, privateKey, jwtOptions, (err, result) => {
      if (err) {
        rej(err);
        return;
      } else {
        res(result!);
      }
    });

  });

}
