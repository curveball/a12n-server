import * as crypto from 'node:crypto';

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
