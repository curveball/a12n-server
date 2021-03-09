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

  const query = 'SELECT resource, privilege FROM user_privileges WHERE user_id = ?';
  const result = await db.query(query, [principal.id]);

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

  const query = 'SELECT id FROM user_privileges WHERE user_id = ? AND privilege = ? AND (resource = ? OR resource = "*")';
  const result = await db.query(query, [user.id, privilege, resource]);

  return result[0].length === 1;

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
