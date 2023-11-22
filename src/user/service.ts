import * as bcrypt from 'bcrypt';
import * as otplib from 'otplib';
import db from '../database';
import { User } from '../types';
import { UnprocessableEntity } from '@curveball/http-errors';

export async function createPassword(user: User, password: string): Promise<void> {

  assertValidPassword(password);
  await db('user_passwords').insert({
    user_id: user.id,
    password: await bcrypt.hash(password, 12)
  });

}

export async function updatePassword(user: User, password: string): Promise<void> {

  assertValidPassword(password);
  await db('user_passwords').insert({
    user_id: user.id,
    password: await bcrypt.hash(password, 12)
  })
  .onConflict('user_id')
  .merge();

}

/**
 * Returns true or false if the password was correct.
 *
 * Calling this method multiple times might result in a block.
 */
export async function validatePassword(user: User, password: string): Promise<boolean> {

  const result = await db('user_passwords')
    .select('password')
    .where('user_id', user.id);

  const hashes = result.map( row => row.password );

  for (const hash of hashes) {

    if (await bcrypt.compare(password, hash)) {
      return true;
    }

  }

  return false;

}

export async function hasPassword(user: User): Promise<boolean> {

  const result = await db('user_passwords')
    .select('user_id')
    .where('user_id', user.id);

  return result.length > 0;

}


/**
 * Returns true or false if the totp token was correct.
 *
 * Calling this method multiple times might result in a block.
 */
export async function validateTotp(user: User, token: string): Promise<boolean> {

  const result = await db('user_totp')
    .select('secret')
    .where('user_id', user.id);

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

  const result = await db('user_totp')
    .select('secret')
    .where('user_id', user.id);

  return result.length !== 0;

}

function assertValidPassword(password: string) {

  if (password.length < 8) {
    throw new UnprocessableEntity('Passwords must be at least 8 characters');
  }

}
