import { randomBytes } from 'crypto';

/**
 * Centralized place for all crypto-related functions
 */


/**
 * Returns a secret, opaque token.
 *
 * The token will use the characters from the base64url character list, which
 * is url-safe.
 */
export function generateSecretToken(bytes = 32): Promise<string> {

  return new Promise<string>((res, rej) => {

    randomBytes(bytes, (err, buf) => {

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
