import { User, App } from '../types';
import { OAuth2Client } from '../oauth2-client/types';
import { generateSecretToken } from '../crypto';
import { getSetting } from '../server-settings';
import { createPrivateKey, KeyObject, createPublicKey } from 'crypto';
import { SignJWT } from 'jose';

export async function generateJWTAccessToken(user: User|App, client: OAuth2Client, expiry: number, scopes: string[]): Promise<string> {

  const origin = process.env.PUBLIC_URI!;
  const jti = await generateSecretToken();

  const privateKey = getPrivateKey();


  const jwt = await new SignJWT({
    scope: scopes.join(' '),
    client_id: client.clientId,
  })
    .setProtectedHeader({
      alg: 'RS256',
      typ: 'at+jwt',
    })
    .setIssuedAt()
    .setIssuer(origin)
    .setAudience(client.app.href)
    .setSubject(user.href)
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiry)
    .setJti(jti)
    .sign(privateKey);

  return jwt;

}

let privateKey: KeyObject|null;

function getPrivateKey(): KeyObject {

  if (privateKey) {
    return privateKey;
  }

  privateKey = createPrivateKey(getRawPrivateKey());
  return privateKey;

}

let publicKey: KeyObject|null;

export function getPublicKey(): KeyObject {

  if (publicKey) return publicKey;

  publicKey = createPublicKey({
    key: getRawPrivateKey()
  });

  return publicKey;

}


function getRawPrivateKey(): Buffer {

  const key = getSetting('jwt.privateKey');
  if (!key) {
    throw new Error('The JWT_PRIVATE_KEY environment variable must be set, and must be a RSA private key file (typically a .pem file)');
  }

  // Some environment variable systems will convert the newline to a literal '\n'.
  // this is a safe operation, because the file should not contain any literal
  // backslashes.
  return Buffer.from(key.replace(/\\n/gm, '\n'));

}
