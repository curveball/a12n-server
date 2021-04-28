import { NotFound } from '@curveball/http-errors';
import database from '../database';
import { Principal, NewPrincipal, PrincipalType, User, Group, App } from './types';

export class InactivePrincipal extends Error { }

export const fieldNames: Array<keyof PrincipalRecord> = [
  'id',
  'identity',
  'nickname',
  'created_at',
  'modified_at',
  'type',
  'active'
];

export async function findAll(type: 'user'): Promise<User[]>;
export async function findAll(type: 'group'): Promise<Group[]>;
export async function findAll(type: 'app'): Promise<App[]>;
export async function findAll(): Promise<Principal[]>;
export async function findAll(type?: PrincipalType): Promise<Principal[]> {

  let result;
  if (type) {
    const query = `SELECT ${fieldNames.join(', ')} FROM principals WHERE type = ?`;
    result = await database.query(query, [userTypeToInt(type)]);
  } else {
    const query = `SELECT ${fieldNames.join(', ')} FROM principals`;
    result = await database.query(query);
  }

  const principals: Principal[] = [];
  for (const principal of result[0]) {
    principals.push(recordToModel(principal));
  }
  return principals;

}

export async function findById(id: number, type: 'user'): Promise<User>;
export async function findById(id: number, type: 'group'): Promise<Group>;
export async function findById(id: number, type: 'app'): Promise<App>;
export async function findById(id: number): Promise<Principal>;
export async function findById(id: number, type?: PrincipalType): Promise<Principal> {

  const query = `SELECT ${fieldNames.join(', ')} FROM principals WHERE id = ?`;
  const result = await database.query(query, [id]);

  if (result[0].length !== 1) {
    throw new NotFound(`Principal with id: ${id} not found`);
  }

  const principal = recordToModel(result[0][0]);

  if (type && principal.type !== type) {
    throw new NotFound(`Principal with id ${id} does not have type ${type}`);
  }
  return principal;

}

export async function findActiveById(id: number): Promise<Principal> {

  const user = await findById(id);
  if (!user.active) {
    throw new InactivePrincipal(`Principal with identity ${user.identity} is not active`);
  }
  return user;

}

/**
 * Returns true if more than 1 principal exists in the system.
 *
 * If there are 0 principals, this puts a12nserver in setup mode, which allows a
 * person to create the first user in the system, automatically activate it
 * and make them an admin.
 */
export async function hasPrincipals(): Promise<boolean> {

  const query = 'SELECT 1 FROM principals LIMIT 1';
  const result = await database.query(query);

  return result[0].length > 0;

}

export async function findByIdentity(identity: string): Promise<Principal> {

  const query = `SELECT ${fieldNames.join(', ')} FROM principals WHERE identity = ?`;
  const result = await database.query(query, [identity]);

  if (result[0].length !== 1) {
    throw new NotFound(`Principal with identity: ${identity} not found`);
  }

  return recordToModel(result[0][0]);

}

/**
 * Finds a principal by its href'.
 *
 * This can be a string like /user/1, or a full url.
 * It can also be the uri listed in the 'identity' field.
 */
export async function findByHref(href: string): Promise<Principal> {

  const pathName = getPathName(href);
  const matches = pathName.match(/^\/(user|app|group)\/([0-9]+)$/);

  if (!matches) {
    return findByIdentity(href);
  }

  let typeFilter;
  switch(matches[1] as 'user' | 'app' | 'group') {
    case 'user' :
      // Backwards compatibility
      typeFilter = [1,2,3];
      break;
    case 'app' :
      typeFilter = [2];
      break;
    case 'group' :
      // Backwards compatibility
      typeFilter = [3];
      break;
  }

  const query = `SELECT ${fieldNames.join(', ')} FROM users WHERE type IN (?) AND id = ?`;
  const result = await database.query(query, [typeFilter, matches[2]]);

  if (result[0].length !== 1) {
    throw new NotFound('Principal with href: ' + href + ' not found');
  }

  return recordToModel(result[0][0]);
}

export async function save<T extends Principal>(principal: Omit<T, 'id' | 'href'> | T): Promise<T> {

  if (!isExistingPrincipal(principal)) {

    // New principal
    const query = 'INSERT INTO principals SET ?';

    const newPrincipalRecord: Omit<PrincipalRecord, 'id'> = {
      identity: principal.identity,
      nickname: principal.nickname,
      type: userTypeToInt(principal.type),
      active: principal.active ? 1 : 0,
      modified_at: Date.now(),
      created_at: Date.now(),
    };

    const result = await database.query(query, [newPrincipalRecord]);

    return {
      id: result[0].insertId,
      ...principal
    } as T;

  } else {

    // Update user
    const query = 'UPDATE principals SET ? WHERE id = ?';

    principal.modifiedAt = new Date();

    const updatePrincipalRecord: Omit<PrincipalRecord, 'id' | 'created_at' | 'type'> = {
      identity: principal.identity,
      nickname: principal.nickname,
      active: principal.active ? 1 : 0,
      modified_at: principal.modifiedAt.getTime(),
    };

    await database.query(query, [updatePrincipalRecord, principal.id]);

    return principal;

  }

}

export type PrincipalRecord = {
  id: number,
  identity: string,
  nickname: string,
  created_at: number,
  modified_at: number,
  type: number,
  active: number
};

function userTypeIntToUserType(input: number): PrincipalType {

  switch (input) {
    case 1: return 'user';
    case 2: return 'app';
    case 3: return 'group';
    default:
      throw new Error('Unknown user type id: ' + input);
  }

}

function userTypeToInt(input: PrincipalType): number {

  switch (input) {
    case 'user': return 1;
    case 'app': return 2;
    case 'group': return 3;
  }

}

export function recordToModel(user: PrincipalRecord): Principal {

  return {
    id: user.id,
    href: `/${userTypeIntToUserType(user.type)}/${user.id}`,
    identity: user.identity,
    nickname: user.nickname,
    createdAt: new Date(user.created_at),
    modifiedAt: new Date(user.modified_at),
    type: userTypeIntToUserType(user.type),
    active: !!user.active
  };

}

function isExistingPrincipal(user: Principal | NewPrincipal): user is Principal {

  return (<Principal> user).id !== undefined;

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
