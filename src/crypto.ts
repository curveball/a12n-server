import * as crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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


const wordList:string[] = [];
export async function loadWordList() {
  if (wordList.length === 0) {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    console.info('🎲 Loading EFF large word list');
    const result = await readFile(join(__dirname, '../assets/eff_large_wordlist.txt'), 'utf8');
    for(const line of result.split('\n')) {
      wordList.push(line.split('\t')[1]);
    }
  }
}

/**
 * Generates a random 'diceware' password, which is a memorable password
 * consisting of several words.
 */
export function generatePassword(): string {

  if (wordList.length < 7000) {
    throw new Error('EFF wordlist was not loaded. Stopping password generation as a security measure.');
  }
  const words = [];
  for(let i=0; i < 6; i++) {
    words.push(wordList[crypto.randomInt(0, wordList.length)]);
  }
  return words.join('-');
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
