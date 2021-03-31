import { Context } from '@curveball/core';
import db from '../database';
import database from '../database';
import { Principal } from '../user/types';
import { Privilege, PrivilegeMap } from './types';

type PrivilegeRow = {
  resource: string,
  privilege: string,
};

export async function getPrivilegesForPrincipal(principal: Principal): Promise<PrivilegeMap> {

  const recursiveGroupIds = await getRecursiveGroupIds(principal.id);

  const query = 'SELECT resource, privilege FROM user_privileges WHERE user_id IN (?)';
  const result = await db.query(query, [recursiveGroupIds]);

  return result[0].reduce( (currentPrivileges: any, row: PrivilegeRow) => {

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
    if (!who.state.user) {
      throw new Error('Cannot check privilege for unauthenticated user');
    }
    user = who.state.user;
  } else {
    user = who;
  }

  const privileges = await getPrivilegesForPrincipal(user);

  return privileges['*']?.includes(privilege) || privileges[resource]?.includes(privilege) || false;

}

function isContext(input: Context| Principal): input is Context {
  return (input as any).request !== undefined && (input as any).response !== undefined;
}

export async function findPrivileges(): Promise<Privilege[]> {

  const query = `
  SELECT privileges.privilege, privileges.description FROM privileges
  UNION ALL
  SELECT DISTINCT user_privileges.privilege, null FROM user_privileges
  LEFT JOIN privileges
  ON privileges.privilege = user_privileges.privilege
  WHERE privileges.privilege IS NULL
  `;

  const result = await database.query(query);

  return result[0];
}

export async function findPrivilege(privilege: string): Promise<Privilege> {

  const query = 'SELECT privilege, description FROM privileges WHERE privilege = ?';
  const result = await database.query(query, [privilege]);

  if (result[0].length !== 1) {
    return {
      privilege: privilege,
      description: ''
    };
  }

  return result[0][0];

}

export async function replacePrivilegeForUser(user: Principal, privilegeMap: PrivilegeMap): Promise<void> {
  const query = 'DELETE FROM user_privileges WHERE user_id = ?';
  await database.query(query, [ user.id ]);

  for (const [ resource, privileges ] of Object.entries(privilegeMap)) {
        for (const privilege of privileges) {
                await addPrivilegeForUser(user, privilege, resource);
        }
  }

}

export async function addPrivilegeForUser(user: Principal, privilege: string, resource: string): Promise<void> {

  const query = 'INSERT INTO user_privileges SET ?';
  await database.query(query, [
    {
      user_id: user.id,
      privilege,
      resource,
    }
  ]);

}

/**
 * Returns a list of all group principals for a user.
 *
 * This basically returns a list of ids of all groups that a user is a part of,
 * recursively, and also includes the id of the user itself.
 */
async function getRecursiveGroupIds(principalId: number): Promise<number[]> {

  const query = 'SELECT group_id FROM group_members WHERE user_id = ?';
  const result: { group_id: number}[] = (await database.query(query, [principalId]))[0];

  const ids = [
    principalId
  ];

  for(const row of result) {
    ids.push(...await getRecursiveGroupIds(row.group_id));
  }

  return ids;

}
