import { Context } from '@curveball/core';
import db from '../database';
import { User } from '../user/types';
import { PrivilegeMap } from './types';

type PrivilegeRow = {
  resource: string,
  scope: string,
};

export async function getPrivilegesForUser(user: User): Promise<PrivilegeMap> {

  const query = 'SELECT resource, scope FROM user_privileges WHERE user_id = ?';
  const result = await db.query(query, [user.id]);

  return result[0].reduce( (currentPrivileges: any, row: PrivilegeRow) => {

    const privileges = Object.assign({}, currentPrivileges);

    if (privileges.hasOwnProperty(row.resource)) {
      if (privileges[row.resource].indexOf(row.scope) === -1) {
        privileges[row.resource].push(row.scope);
      }
    } else {
      privileges[row.resource] = [row.scope];
    }

    return privileges;

  }, {});

}

export function hasPrivilege(ctx: Context, privilege: string, resource?: string): Promise<boolean>;
export function hasPrivilege(user: User, privilege: string, resource?: string): Promise<boolean>;
export async function hasPrivilege(who: User | Context, privilege: string, resource: string = '*'): Promise<boolean> {

  let user;
  if (who instanceof Context) {
    if (!who.state.user) {
      throw new Error('Cannot check privilege for unauthenticated user');
    }
    user = who.state.user;
  } else {
    user = who;
  }

  const query = 'SELECT id FROM user_privileges WHERE user_id = ? AND scope = ? AND (resource = ? OR resource = "*")';
  const result = await db.query(query, [user.id, privilege, resource]);

  return result[0].length === 1;

}
