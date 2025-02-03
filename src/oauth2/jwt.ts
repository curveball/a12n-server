import { User, App, AppClient, PrincipalIdentity } from '../types.js';
import { generateSecretToken } from '../crypto.js';
import { getSetting } from '../server-settings.js';
import { createPrivateKey, KeyObject, createPublicKey } from 'crypto';
import { SignJWT } from 'jose';
import { getGlobalOrigin } from '@curveball/kernel';
import { userInfo } from '../oidc/format/json.js';

type AccessTokenOptions = {
  principal: User|App;
  client: AppClient;
  expiry: number;
  scope: string[];
}

export async function generateJWTAccessToken(options: AccessTokenOptions): Promise<string> {

  const jti = await generateSecretToken();

  const privateKey = getPrivateKey();

  const jwt = await new SignJWT({
    scope: options.scope.join(' '),
    client_id: options.client.clientId,
  })
    .setProtectedHeader({
      alg: 'RS256',
      typ: 'at+jwt',
    })
    .setIssuedAt()
    .setIssuer(getGlobalOrigin())
    .setAudience(options.client.app.href)
    .setSubject(options.principal.href)
    .setExpirationTime(Math.floor(Date.now() / 1000) + options.expiry)
    .setJti(jti)
    .sign(privateKey);

  return jwt;

}

type IDTokenOptions = {
  principal: User;
  client: AppClient;
  nonce: null | string;
  identities: PrincipalIdentity[];
  loginTime: number | null;
}

export async function generateJWTIDToken(options: IDTokenOptions) {

  const privateKey = getPrivateKey();

  const body: Record<string, number|string|boolean> = userInfo(options.principal, options.identities);

  if (options.nonce) {
    body.nonce = options.nonce;
  }
  if (options.loginTime) {
    body.auth_time = Math.floor(options.loginTime / 1000);
  }

  const jwt = await new SignJWT(body)
    .setProtectedHeader({
      alg: 'RS256',
    })
    .setIssuedAt()
    .setIssuer(getGlobalOrigin())
    .setAudience(options.client.clientId)
    .setSubject(options.principal.href)
    .setExpirationTime(Math.floor(Date.now() / 1000) + getSetting('oidc.idToken.expiry'))
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
