import { NotFound, UnprocessableEntity } from '@curveball/http-errors';
import db, { query, insertAndGetId } from '../database';
import { Principal, NewPrincipal, PrincipalType, User, Group, App, PrincipalStats, BasePrincipal } from './types';
import { Principal as PrincipalRecord } from 'knex/types/tables';
import { generatePublicId } from '../crypto';

export class InactivePrincipal extends Error { }

export const fieldNames: Array<keyof PrincipalRecord> = [
  'id',
  'identity',
  'external_id',
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

  const filters: Record<string, any> = {};
  if (type) {
    filters.type = userTypeToInt(type);
  }

  const result = await db('principals')
    .where(filters);

  const principals: Principal[] = [];
  for (const principal of result) {
    principals.push(recordToModel(principal));
  }
  return principals;

}

export async function getPrincipalStats(): Promise<PrincipalStats> {

  const result = await db<any>('principals')
    .select(['type', db.raw('COUNT(*) as total')])
    .groupBy('type');

  const principalStats: Record<PrincipalType, number> = {
    user: 0,
    app: 0,
    group: 0
  };

  for (const principal of result) {
    principalStats[userTypeIntToUserType(principal.type)] = principal.total;
  }

  return principalStats;

}

export async function findById(id: number, type: 'user'): Promise<User>;
export async function findById(id: number, type: 'group'): Promise<Group>;
export async function findById(id: number, type: 'app'): Promise<App>;
export async function findById(id: number): Promise<Principal>;
export async function findById(id: number, type?: PrincipalType): Promise<Principal> {

  const result = await db('principals')
    .select(fieldNames)
    .where({id});

  if (result.length !== 1) {
    throw new NotFound(`Principal with id: ${id} not found`);
  }

  const principal = recordToModel(result[0]);

  if (type && principal.type !== type) {
    throw new NotFound(`Principal with id ${id} does not have type ${type}`);
  }
  return principal;

}

export async function findByExternalId(externalId: string, type: 'user'): Promise<User>;
export async function findByExternalId(externalId: string, type: 'group'): Promise<Group>;
export async function findByExternalId(externalId: string, type: 'app'): Promise<App>;
export async function findByExternalId(externalId: string): Promise<Principal>;
export async function findByExternalId(externalId: string, type?: PrincipalType): Promise<Principal> {

  let result = await db('principals')
    .select(fieldNames)
    .where({external_id: externalId});

  if (result.length !== 1) {
    // Trying to find the principal but now use the id field
    result = await db('principals')
      .select(fieldNames)
      .where({id: externalId});

    if (result.length !== 1) {
      throw new NotFound(`Principal with id: ${externalId} not found`);
    }
  }

  const principal = recordToModel(result[0]);

  if (type && principal.type !== type) {
    throw new NotFound(`Principal with id ${externalId} does not have type ${type}`);
  }
  return principal;

}

/**
 * Returns true if more than 1 principal exists in the system.
 *
 * If there are 0 principals, this puts a12nserver in setup mode, which allows a
 * person to create the first user in the system, automatically activate it
 * and make them an admin.
 */
export async function hasPrincipals(): Promise<boolean> {

  const result = await query('SELECT 1 FROM principals LIMIT 1');
  return result.length > 0;

}

export async function findByIdentity(identity: string): Promise<Principal> {

  const result = await query(
    `SELECT ${fieldNames.join(', ')} FROM principals WHERE identity = ?`,
    [identity]
  );

  if (result.length !== 1) {
    throw new NotFound(`Principal with identity: ${identity} not found`);
  }

  return recordToModel(result[0]);

}

/**
 * Finds a principal by its href'.
 *
 * This can be a string like /user/1, or a full url.
 * It can also be the uri listed in the 'identity' field.
 */
export async function findByHref(href: string): Promise<Principal> {

  const pathName = getPathName(href);
  const matches = pathName.match(/^\/(user|app|group)\/([0-9a-zA-Z_-]+)$/);

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

  const result = await query(
    `SELECT ${fieldNames.join(', ')} FROM principals WHERE type IN (${typeFilter.map(_ => '?').join(',')}) AND id = ?`,
    [...typeFilter, matches[2]]
  );

  if (result.length !== 1) {
    throw new NotFound('Principal with href: ' + href + ' not found');
  }

  return recordToModel(result[0]);
}

export async function save<T extends PrincipalType>(principal: BasePrincipal<T>|NewPrincipal<T> ): Promise<BasePrincipal<T>> {

  if (!isExistingPrincipal(principal)) {

    const externalId = await generatePublicId();

    const newPrincipalRecord: Omit<PrincipalRecord, 'id'> = {
      identity: principal.identity,
      external_id: externalId,
      nickname: principal.nickname,
      type: userTypeToInt(principal.type),
      active: principal.active ? 1 : 0,
      modified_at: Date.now(),
      created_at: Date.now(),
    };

    const result = await insertAndGetId('principals', newPrincipalRecord);

    return {
      id: result,
      href: `/${principal.type}/${result}`,
      externalId,
      ...principal
    };

  } else {

    // Update user

    if (!isIdentityValid(principal.identity)) {
      throw new UnprocessableEntity('Identity must be a valid URI');
    }

    principal.modifiedAt = new Date();

    const updatePrincipalRecord: Omit<PrincipalRecord, 'id' | 'created_at' | 'type' | 'external_id'> = {
      identity: principal.identity,
      nickname: principal.nickname,
      active: principal.active ? 1 : 0,
      modified_at: principal.modifiedAt.getTime(),
    };


    await db('principals')
      .where('id', principal.id)
      .update(updatePrincipalRecord);

    return principal;

  }

}

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
    href: `/${userTypeIntToUserType(user.type)}/${user.external_id}`,
    identity: user.identity,
    externalId: user.external_id,
    nickname: user.nickname,
    createdAt: new Date(user.created_at),
    modifiedAt: new Date(user.modified_at),
    type: userTypeIntToUserType(user.type),
    active: !!user.active
  };

}

export function isIdentityValid(identity: string): boolean {

  const regex = /^(?:[A-Za-z]+:\S*$)?/;
  return regex.test(identity);

}

function isExistingPrincipal(user: Principal | NewPrincipal<any>): user is Principal {

  return (user as Principal).id !== undefined;

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
