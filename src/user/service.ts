import * as bcrypt from 'bcrypt';
import * as otplib from 'otplib';
import database from '../database';
import { User } from '../principal/types';

type PasswordRow = {
  password: Buffer;
};

export async function createPassword(user: User, password: string): Promise<void> {

  const query = 'INSERT INTO user_passwords SET user_id = ?, password = ?';
  await database.query(query, [
    user.id,
    await bcrypt.hash(password, 12)
  ]);

}

export async function updatePassword(user: User, password: string): Promise<void> {

  const query = 'INSERT INTO user_passwords (password, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE password = ?';
  const hashedPw = await bcrypt.hash(password, 12);

  await database.query(query, [hashedPw, user.id, hashedPw]);

}

/**
 * Returns true or false if the password was correct.
 *
 * Calling this method multiple times might result in a block.
 */
export async function validatePassword(user: User, password: string): Promise<boolean> {

  const query = 'SELECT password FROM user_passwords WHERE user_id = ?';
  const result = await database.query(query, [user.id]);

  const hashes = result.map( (row: PasswordRow) => row.password );

  for (const hash of hashes) {

    if (await bcrypt.compare(password, hash.toString('utf-8'))) {
      return true;
    }

  }

  return false;

}

export async function hasPassword(user: User): Promise<boolean> {

  const query = 'SELECT user_id FROM user_passwords WHERE user_id = ? LIMIT 1';
  const result = await database.query(query, [user.id]);
  return result.length > 0;

}


/**
 * Returns true or false if the totp token was correct.
 *
 * Calling this method multiple times might result in a block.
 */
export async function validateTotp(user: User, token: string): Promise<boolean> {

  const query = 'SELECT secret FROM user_totp WHERE user_id = ?';
  const result = await database.query(query, [user.id]);

  if (!result.length) {
    // Not set up
    return false;
  }
  const secret = result[0].secret;

  return otplib.authenticator.check(token, secret);

}

/**
 * Returns true or false if the totp was provided or not.
 *
 *
 */
export async function hasTotp(user: User): Promise<boolean> {

  const query = 'SELECT secret FROM user_totp WHERE user_id = ?';
  const result = await database.query(query, [user.id]);

  return result.length !== 0;

}
