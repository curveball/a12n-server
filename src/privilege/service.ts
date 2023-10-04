import { Context } from '@curveball/core';
import db, { query } from '../database';
import { Principal } from '../types';
import { Privilege, PrivilegeMap, PrivilegeEntry, InternalPrivilege } from './types';
import { UserPrivilegesRecord } from 'knex/types/tables';
import { PrincipalService } from '../principal/service';
import { Forbidden } from '@curveball/http-errors';


/**
 * Returns all privileges associated with a single principal.
 */
export async function get(who: Context | Principal | 'insecure'): Promise<LazyPrivilegeBox> {

  const box = new LazyPrivilegeBox(who);
  await box.ready();
  return box;

}

/**
 * Returns all privileges defined on a single resource.
 */
export async function findPrivilegesForResource(resource: string): Promise<PrivilegeEntry[]> {

  const principalService = new PrincipalService('insecure');
  const records = await db('user_privileges')
    .select('*')
    .where({resource}).orWhere({resource: '*'});

  const principals = await principalService.findMany(
    records.map(record => record.user_id)
  );

  return records.map(record => ({
    privilege: record.privilege,
    resource: record.resource,
    principal: principals.get(record.user_id)!,
  }));

}

/**
 * Get all the privileges assigned to a principal, excluding privileges
 * the principal inherited by being part of a group.
 */
export async function getImmediatePrivilegesForPrincipal(principal: Principal): Promise<PrivilegeMap> {

  const result = await query(
    'SELECT resource, privilege FROM user_privileges WHERE user_id = ?',
    [principal.id]
  );

  return result.reduce( (currentPrivileges: any, row: UserPrivilegesRecord) => {

    const privileges = Object.assign({}, currentPrivileges);

    // eslint-disable-next-line no-prototype-builtins
    if (privileges.hasOwnProperty(row.resource)) {
      if (privileges[row.resource].indexOf(row.privilege) === -1) {
        privileges[row.resource].push(row.privilege);
      }
    } else {
      privileges[row.resource] = [row.privilege];
    }

    return privileges;

  }, {});


}

/**
 * Helper class for checking privileges.
 *
 * This class represents the set of privileges for a user.
 * It mostly operates synchronously, but it loads privileges asynchronously.
 *
 * To ensure it's fully loaded await the ready() function.
 */
export class LazyPrivilegeBox {

  who: Principal | 'insecure' | 'public';
  privileges: PrivilegeMap | null = null;
  private init: Promise<unknown> | null;

  constructor(who: Principal | Context | 'insecure') {

    if (isContext(who)) {
      if (!who.auth.isLoggedIn()) {
        this.who = 'public';
      } else {
        this.who = who.auth.principal;
      }
    } else {
      this.who = who;
    }
    this.init = this.reload();
  }

  getAll(): PrivilegeMap {

    if (this.privileges === null) {
      throw new Error('List of privileges have not been loaded');
    }
    return this.privileges;

  }

  has(privilege: InternalPrivilege, resource: string = '*'): boolean {

    if (this.who === 'public') return false;
    if (this.who === 'insecure') return true;

    const privileges = this.getAll();
    return privileges['*']?.includes(privilege) || privileges[resource]?.includes(privilege) || privileges['*']?.includes('admin') || privileges[resource]?.includes('admin') || false;

  }

  require(privilege: InternalPrivilege, resource: string = '*'): void {

    if (!this.has(privilege, resource)) {
      if (this.who === 'public') {
        throw new Forbidden('You must be authenticated for this operation');
      }
      throw new Forbidden(`The currently logged in user must have the "${privilege}" privilege on the "${resource}" to do this`);
    }
  }

  /**
   * Await the result of this function to ensure that privleges have been loaded.
   */
  async ready(): Promise<void> {

    await this.init;

  }

  /**
   * Reloads privileges from the database
   */
  async reload(): Promise<PrivilegeMap> {

    if (this.who === 'insecure' || this.who === 'public') {
      this.privileges = {};
    } else {
      this.privileges = await getPrivilegesForPrincipal(this.who);
    }
    return this.privileges;

  }

  /**
   * Returns true if the passed principal matches principal associated with
   * the current set of privileges.
   */
  isPrincipal(principal: Principal): boolean {

    if (this.who === 'insecure' || this.who === 'public') return false;
    return this.who.id === principal.id;

  }

}


function isContext(input: Context| Principal | 'insecure'): input is Context {
  return (input as any).request !== undefined && (input as any).response !== undefined;
}

/**
 * Returns the list of 'privilege types'
 */
export async function findPrivilegeTypes(): Promise<Privilege[]> {

  const result = await query<Privilege>(`
  SELECT privileges.privilege, privileges.description FROM privileges
  UNION ALL
  SELECT DISTINCT user_privileges.privilege, null FROM user_privileges
  LEFT JOIN privileges
  ON privileges.privilege = user_privileges.privilege
  WHERE privileges.privilege IS NULL`
  );

  return result;
}

export async function findPrivilegeType(privilege: string): Promise<Privilege> {

  const result = await db('privileges')
    .select('*')
    .where({privilege});

  if (result.length !== 1) {
    return {
      privilege: privilege,
      description: ''
    };
  }
  return result[0];

}

export async function replacePrivilegeForUser(user: Principal, privilegeMap: PrivilegeMap): Promise<void> {

  await db.transaction(async trx => {

    await trx.raw('DELETE FROM user_privileges WHERE user_id = ?', [ user.id ]);

    for (const [ resource, privileges ] of Object.entries(privilegeMap)) {
      for (const privilege of privileges) {

        await trx('user_privileges').insert({
          user_id: user.id,
          privilege,
          resource,
        });

      }
    }

    await trx.commit();

  });
}

export async function addPrivilegeForUser(user: Principal, privilege: string, resource: string): Promise<void> {

  await db('user_privileges').insert({
    user_id: user.id,
    privilege,
    resource,
  });

}

/**
 * Returns a list of all group principals for a user.
 *
 * This basically returns a list of ids of all groups that a user is a part of,
 * recursively, and also includes the id of the user itself.
 */
async function getRecursiveGroupIds(principalId: number): Promise<number[]> {

  const q = 'SELECT group_id FROM group_members WHERE user_id = ?';
  const result: { group_id: number }[] = (await query(q, [principalId]));

  const ids = [
    principalId
  ];

  for(const row of result) {
    ids.push(...await getRecursiveGroupIds(row.group_id));
  }

  return ids;

}

async function getPrivilegesForPrincipal(principal: Principal): Promise<PrivilegeMap> {

  const recursiveGroupIds = await getRecursiveGroupIds(principal.id);
  if (principal.type === 'user') recursiveGroupIds.push(await getAllUsersGroupId());

  const result = await query(
    `SELECT resource, privilege FROM user_privileges WHERE user_id IN (${recursiveGroupIds.map(_ => '?').join(',')})`,
    [...recursiveGroupIds]
  );

  return result.reduce( (currentPrivileges: any, row: UserPrivilegesRecord) => {

    const privileges = Object.assign({}, currentPrivileges);

    // eslint-disable-next-line no-prototype-builtins
    if (privileges.hasOwnProperty(row.resource)) {
      if (privileges[row.resource].indexOf(row.privilege) === -1) {
        privileges[row.resource].push(row.privilege);
      }
    } else {
      privileges[row.resource] = [row.privilege];
    }

    return privileges;

  }, {});

}

let allUsersGroupId: number|null = null;

/**
 * Returns the set of privileges for the $all group
 */
async function getAllUsersGroupId() {

  if (allUsersGroupId) return allUsersGroupId;
  const allPrincipal = await db('principals')
    .select('id')
    .first()
    .where({
      external_id: '$all',
      type: 3
    });

  if (!allPrincipal) {
    throw new Error('Could not find the $all group in the database!');
  }
  allUsersGroupId = allPrincipal.id;
  return allUsersGroupId;

}
