import * as crypto from 'node:crypto';
import generatePassphrase from 'eff-diceware-passphrase';

/**
 * Centralized place for all crypto-related functions
 */


/**
 * Returns a secret, opaque token.
 *
 * The token will use the characters from the base64url character list, which
 * is url-safe.
 */
export function generateSecretToken(): Promise<string> {

  return generateUrlSafeString(32);

}

/**
 * Generates an id
 *
 * The id is not meant to be secret, but is meant to be not numerable, making it
 * hard to guess (for example) how many users exist.
 */
export function generatePublicId(): Promise<string> {

  return generateUrlSafeString(8);

}

/**
 * Generates a UUID urn
 */
export function uuidUrn() {

  return `urn:uuid:${crypto.randomUUID()}`;

}

/**
 * Generates a random 'diceware' password, which is a memorable password
 * consisting of several words.
 */
export function generatePassword(): string {

  return generatePassphrase.entropy(45).join('-');

}

/**
 * Generates a short code for verification purposes.
 *
 * For example, this code might be sent over email or SMS. It doesn't
 * have a lot of entropy so there's a risk of bruteforcing, which needs
 * to be protected against.
 */
export function generateVerificationDigits(digits = 6): string {

  return crypto.randomInt(0,10**digits)
    .toString()
    .padStart(digits, '0');

}

function generateUrlSafeString(bytes: number): Promise<string> {

  return new Promise<string>((res, rej) => {

    crypto.randomBytes(bytes, (err, buf) => {

      if (err) {
        rej(err);
        return;
      }

      const base64Url = buf.toString('base64')
        .replace(/\+/g, '-') // + -> -
        .replace(/\//g, '_') // / -> _
        .replace(/=/g, '');  // Strip =

      res(
        base64Url
      );

    });

  });


}
