import { NotFound } from '@curveball/http-errors';
import * as bcrypt from 'bcrypt';
import * as otplib from 'otplib';
import database from '../database';
import { NewUser, User, UserType } from './types';

export class InactiveUser extends Error { }

export const fieldNames = [
  'id',
  'identity',
  'nickname',
  'created',
  'type',
  'active'
];

export async function findAll(): Promise<User[]> {

  const query = `SELECT ${fieldNames.join(', ')} FROM users`;
  const result = await database.query(query);

  const users: User[] = [];
  for (const user of result[0]) {
    users.push(recordToModel(user));
  }
  return users;

}

export async function findById(id: number): Promise<User> {

  const query = `SELECT ${fieldNames.join(', ')} FROM users WHERE id = ?`;
  const result = await database.query(query, [id]);

  if (result[0].length !== 1) {
    throw new NotFound('User with id: ' + id + ' not found');
  }

  return recordToModel(result[0][0]);

}
export async function findActiveById(id: number): Promise<User> {

  const user = await findById(id);
  if (!user.active) {
    throw new InactiveUser('User with identity ' + user.identity + ' is not active');
  }
  return user;

}

/**
 * Returns true if more than 1 user exists in the system.
 *
 * If there are 0 users, this puts a12nserver in setup mode, which allows a
 * person to create the first user in the system, automatically activate it
 * and make them an admin.
 */
export async function hasUsers(): Promise<boolean> {

  const query = 'SELECT 1 FROM users LIMIT 1';
  const result = await database.query(query);

  return result[0].length > 0;

}

export async function findByIdentity(identity: string): Promise<User> {

  const query = `SELECT ${fieldNames.join(', ')} FROM users WHERE identity = ?`;
  const result = await database.query(query, [identity]);

  if (result[0].length !== 1) {
    throw new NotFound('User with identity: ' + identity + ' not found');
  }

  return recordToModel(result[0][0]);

}

/**
 * Finds a user by its href'.
 *
 * This can be a string like /user/1, or a full url.
 * It can also be the uri listed in the 'identity' field.
 */
export async function findByHref(href: string): Promise<User> {

  const pathName = getPathName(href);
  const matches = pathName.match(/^\/user\/([0-9]+)$/);

  if (!matches) {
    return findByIdentity(href);
  }

  const query = `SELECT ${fieldNames.join(', ')} FROM users WHERE id = ?`;
  const result = await database.query(query, [matches[1]]);

  if (result[0].length !== 1) {
    throw new NotFound('User with href: ' + href + ' not found');
  }

  return recordToModel(result[0][0]);
}


export async function save(user: User | NewUser): Promise<User> {

  if (!isExistingUser(user)) {

    // New user
    const query = 'INSERT INTO users SET ?, created = UNIX_TIMESTAMP()';

    const newUserRecord: Partial<UserRecord> = {
      identity: user.identity,
      nickname: user.nickname,
      type: userTypeToInt(user.type),
      active: user.active ? 1 : 0
    };

    const result = await database.query(query, [newUserRecord]);

    return {
      id: result[0].insertId,
      ...user
    };

  } else {

    // Update user
    const query = 'UPDATE users SET ? WHERE id = ?';

    const updateUserRecord: Partial<UserRecord> = {
      identity: user.identity,
      nickname: user.nickname,
    };

    await database.query(query, [updateUserRecord, user.id]);

    return user;

  }

}


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

  const query = 'UPDATE user_passwords SET password = ? WHERE user_id = ?';
  await database.query(query, [
    await bcrypt.hash(password, 12),
    user.id
  ]);

}
/**
 * Returns true or false if the password was correct.
 *
 * Calling this method multiple times might result in a block.
 */
export async function validatePassword(user: User, password: string): Promise<boolean> {

  const query = 'SELECT password FROM user_passwords WHERE user_id = ?';
  const result = await database.query(query, [user.id]);

  const hashes = result[0].map( (row: PasswordRow) => row.password );

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
  return result[0].length > 0;

}


/**
 * Returns true or false if the totp token was correct.
 *
 * Calling this method multiple times might result in a block.
 */
export async function validateTotp(user: User, token: string): Promise<boolean> {

  const query = 'SELECT secret FROM user_totp WHERE user_id = ?';
  const result = await database.query(query, [user.id]);

  if (!result[0].length) {
    // Not set up
    return false;
  }
  const secret = result[0][0].secret;

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

  return result[0].length !== 0;

}

export type UserRecord = {
  id: number,
  identity: string,
  nickname: string,
  created: number,
  type: number,
  active: number
};

function userTypeIntToUserType(input: number): UserType {

  switch (input) {
    case 1: return 'user';
    case 2: return 'app';
    case 3: return 'group';
    default:
      throw new Error('Unknown user type id: ' + input);
  }

}

function userTypeToInt(input: UserType): number {

  switch (input) {
    case 'user': return 1;
    case 'app': return 2;
    case 'group': return 3;
  }

}

export function recordToModel(user: UserRecord): User {

  return {
    id: user.id,
    identity: user.identity,
    nickname: user.nickname,
    created: new Date(user.created * 1000),
    type: userTypeIntToUserType(user.type),
    active: !!user.active
  };

}

function isExistingUser(user: User | NewUser): user is User {

  return (<User> user).id !== undefined;

}

export function getPathName(href: string): string {

  let url;

  try {
    url = new URL(href);
  } catch {
    return href;
  }
  return url.pathname;

}
