import { BadRequest, UnprocessableContent } from '@curveball/http-errors';
import * as bcrypt from 'bcrypt';
import db from '../database.ts';

import { UserInfoRecord } from 'knex/types/tables.js';
import { UserEventLogger } from '../log/types.ts';
import * as loginActivityService from '../login/login-activity/service.ts';
import { getSetting } from '../server-settings.ts';
import { User, UserInfo } from '../types.ts';
import { IncorrectPassword, TooManyLoginAttemptsError } from './error.ts';
export async function createPassword(user: User, password: string): Promise<void> {

  assertValidPassword(password);
  await db('user_passwords').insert({
    user_id: user.id,
    password: await bcrypt.hash(password, 12)
  });

}

export async function updatePassword(user: User, password: string): Promise<void> {

  assertValidPassword(password);
  const passwordHash = await bcrypt.hash(password, 12);
  await db('user_passwords').insert({
    user_id: user.id,
    password: passwordHash,
  })
    .onConflict('user_id')
    .merge({
      password: passwordHash,
    });

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
  if (password.length > 72) {
    throw new UnprocessableContent('Passwords must be at most 72 characters');
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

/**
 * @description - Given a principal User, uses the principal id to find the UserInfo record for a user.
 * @param user - The principal User to find the UserInfo record for.
 * @returns The UserInfo record for the user.
 * @throws NotFound - If the UserInfo record is not found.
 */
export async function findUserInfoByUser(user: User): Promise<UserInfo> {
  if (!user || user.type !== 'user') throw new BadRequest('UserInfo lookup failed: user is not a user or is not found');

  const result = await db('user_info')
    .select()
    .where({principal_id: user.id})
    .first();

  if (!result) {
    // No user_info record found, so return an empty UserInfo object
    return {
      name: null,
      locale: null,
      givenName: null,
      middleName: null,
      familyName: null,
      birthdate: null,
      address: null,
      zoneinfo: null,
      metadata: {},
    };
  }

  return recordToModel(result as UserInfoRecord);
}

/**
 * @description - Given a principal User, uses the principal id to find the Principal user and update the UserInfo record for a user.
 * @param user - The principal User to update the UserInfo record for.
 * @param userInfo - new UserInfo object to update the UserInfo record with.
 * @returns The updated UserInfo record.
 */
export async function updateUserInfo(user: User, userInfo: UserInfo): Promise<void> {

  const newUserInfoValues: Partial<UserInfoRecord> = {
    name: userInfo.name,
    locale: userInfo.locale,
    given_name: userInfo.givenName,
    family_name: userInfo.familyName,
    birthdate: userInfo.birthdate ? new Date(userInfo.birthdate) : null,
    address: userInfo.address ? JSON.stringify(userInfo.address) : null,
    zoneinfo: userInfo.zoneinfo
  };

  await db('user_info')
    .insert({
      ...newUserInfoValues,
      principal_id: user.id,
      created_at: Date.now(),
      modified_at: Date.now(),
    })
    .onConflict('principal_id')
    .merge({
      ...newUserInfoValues,
      modified_at: Date.now(),
    });
}

/**
 * Given a UserInfo record from database, converts the record to a UserInfo object.
 * @param {UserInfoRecord} record - The UserInfo record to convert to a UserInfo object.
 */
export async function recordToModel(record: UserInfoRecord): Promise<UserInfo> {

  return {
    name: record.name,
    locale: record.locale,
    givenName: record.given_name,
    middleName: record.middle_name,
    familyName: record.family_name,
    // Sqlite gives us a string, MySQL and PG give us a Date object. Wrapping the result in new Date()
    // ensures we always get a Date object, which we then grab the date portion of (first 10 characters).
    birthdate: record.birthdate ? new Date(record.birthdate).toISOString().slice(0, 10) : null,
    address: record.address ? JSON.parse(record.address) : null,
    zoneinfo: record.zoneinfo,
    metadata: record.metadata ? JSON.parse(record.metadata) : {},
  };
}
