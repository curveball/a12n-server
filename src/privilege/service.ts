import { Context } from '@curveball/core';
import db, { query } from '../database';
import { Principal } from '../principal/types';
import { Privilege, PrivilegeMap } from './types';
import { UserPrivilegesRecord } from 'knex/types/tables';

export async function getPrivilegesForPrincipal(principal: Principal): Promise<PrivilegeMap> {

  const recursiveGroupIds = await getRecursiveGroupIds(principal.id);

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

export async function hasPrivilege(who: Principal | Context, privilege: string, resource: string = '*'): Promise<boolean> {

  let user;
  if (isContext(who)) {
    if (!who.auth.isLoggedIn()) {
      throw new Error('Cannot check privilege for unauthenticated user');
    }
    user = who.auth.principal;
  } else {
    user = who;
  }

  const privileges = await getPrivilegesForPrincipal(user);

  return privileges['*']?.includes(privilege) || privileges[resource]?.includes(privilege) || false;

}

function isContext(input: Context| Principal): input is Context {
  return (input as any).request !== undefined && (input as any).response !== undefined;
}

/**
 * Returns the list of 'privilege types'
 */
export async function findPrivileges(): Promise<Privilege[]> {

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

export async function findPrivilege(privilege: string): Promise<Privilege> {

  const result = await query<Privilege>(
    'SELECT privilege, description FROM privileges WHERE privilege = ?',
    [privilege]
  );

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
