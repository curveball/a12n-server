import { UnprocessableContent } from '@curveball/http-errors';
import * as bcrypt from 'bcrypt';
import db from '../database.js';
import { UserEventLogger } from '../log/types.js';
import * as loginActivityService from '../login/login-activity/service.js';
import { getSetting } from '../server-settings.js';
import { User } from '../types.js';
import { IncorrectPassword, TooManyLoginAttemptsError } from './error.js';

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

function assertValidPassword(password: string) {

  if (password.length < 8) {
    throw new UnprocessableContent('Passwords must be at least 8 characters');
  }

}


/**
 * Validate the user password and handle login attempts.
 *
 * Throws one of the following errors:
 *   * TooManyLoginAttemptsError
 *   * IncorrectPassword
 */
export async function validateUserCredentials(user: User, password: string, log: UserEventLogger): Promise<boolean> {

  const admin = getSetting('smtp.emailFrom') || 'an administrator';

  const TOO_MANY_FAILED_ATTEMPTS = `Too many failed login attempts, please contact ${admin} to unlock your account.`;

  if (await loginActivityService.isAccountLocked(user)) {
    await loginActivityService.incrementFailedLoginAttempts(user);
    await log('login-failed-account-locked');
    throw new TooManyLoginAttemptsError(TOO_MANY_FAILED_ATTEMPTS);
  }

  if (!await validatePassword(user, password)) {
    const incrementedAttempts = await loginActivityService.incrementFailedLoginAttempts(user);

    if (loginActivityService.reachedMaxAttempts(incrementedAttempts)) {
      await log('account-locked');
      throw new TooManyLoginAttemptsError(TOO_MANY_FAILED_ATTEMPTS);
    }

    await log('password-check-failed');
    throw new IncorrectPassword();

  }

  await log('password-check-success');
  await loginActivityService.resetFailedLoginAttempts(user);

  return true;
}

