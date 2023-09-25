import { NotFound } from '@curveball/http-errors';
import db from '../database';
import { Principal, PrincipalType, User, Group, App } from '../types';
import { PrincipalsRecord } from 'knex/types/tables';

export const fieldNames: Array<keyof PrincipalsRecord> = [
  'id',
  'identity',
  'external_id',
  'nickname',
  'created_at',
  'modified_at',
  'type',
  'active',
  'system',
];


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



/**
 * Find multiple principals.
 *
 * This function returns the principals as a map, index by their id.
 * This is a helper function typically used by other services to find large numbers
 * of joined principals from other tables fast.
 *
 * If any of the ids in the list is duplicated, they are de-duplicated here.
 * if any of the provided ids are not found, this function will error.
 */
export async function findMany(ids: number[]): Promise<Map<number,Principal>> {

  const records = await db('principals')
    .select()
    .whereIn('id', ids);

  const result = new Map<number, Principal>(records.map(
    record => [record.id, recordToModel(record)]
  ));

  for (const id of ids) {
    if (!result.has(id)) {
      throw new NotFound(`Principal with ${id} not found`);
    }
  }

  return result;

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

export function recordToModel(user: PrincipalsRecord): Principal {

  return {
    id: user.id,
    href: `/${userTypeIntToUserType(user.type)}/${user.external_id}`,
    identity: user.identity,
    externalId: user.external_id,
    nickname: user.nickname!,
    createdAt: new Date(user.created_at),
    modifiedAt: new Date(user.modified_at),
    type: userTypeIntToUserType(user.type),
    active: !!user.active,
    system: !!user.system,
  };

}

export function isIdentityValid(identity: string): boolean {

  const regex = /^(?:[A-Za-z]+:\S*$)?/;
  return regex.test(identity);

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
