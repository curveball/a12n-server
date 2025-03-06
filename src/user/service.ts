import { BadRequest, NotFound, UnprocessableContent } from '@curveball/http-errors';
import * as bcrypt from 'bcrypt';
import db from '../database.ts';
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

  const result = await db('user_info')
      .select()
      .where({principal_id: user.id})
      .first();

  if (!result) throw new NotFound(`UserInfo for user "${user.id}" not found.`);

  return recordToModel(user, result);
}

/**
 * @description - Given a principal User, uses the principal id to find the Principal user and update the UserInfo record for a user.
 * @param user - The principal User to update the UserInfo record for.
 * @param userInfo - new UserInfo object to update the UserInfo record with.
 * @returns The updated UserInfo record.
 * @throws BadRequest - If the UserInfo record is not updated.
 */
export async function updateUserInfo(user: User, userInfo: UserInfo): Promise<UserInfo> {
  
  const result = await db('user_info')
    .where({principal_id: user.id})
    .update(userInfo)
    .returning('*')
    .first()

  if (!result) throw new BadRequest(`UserInfo for user "${user.id}" was not updated.`);

  return recordToModel(user, result);
}

type UserInfoRecord = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name: string;
  website?: string;
  zoneinfo?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  locale?: string;
  updated_at: number;
  picture?: string;
  address?: string;
  birthdate?: string;
}
  
export async function recordToModel(user: User, record: UserInfoRecord): Promise<UserInfo> {  
  const identities = await db('principal_identities')
    .select()
    .where({ principal_id: user.id })

  for (const identity of identities) {
    if (!record.email && identity.uri.startsWith('mailto:') && identity.is_primary) {
      record.email = identity.uri.replace('mailto:', '');
      record.email_verified = identity.verified_at ? true : false;
    }
    if (!record.phone_number && identity.uri.startsWith('tel:') && identity.is_primary) {
      record.phone_number = identity.uri.replace('tel:', '');
      record.phone_number_verified = identity.verified_at ? true : false;
    }
  }

  return {
    createdAt: new Date(record.updated_at),
    modifiedAt: new Date(record.updated_at),
    name: record.name,
    phoneNumber: record.phone_number || '',
    phoneNumberVerified: record.phone_number_verified || false,
    email: record.email || '',
    emailVerified: record.email_verified || false,
    locale: record.locale || '',
    givenName: record.given_name || '',
    familyName: record.family_name || '',
    birthDate: record.birthdate ||  '',
    address: record.address || '',
    zoneInfo: record.zoneinfo || '',
  };
}