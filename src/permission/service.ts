import db from '../database';
import { User } from '../user/types';

type PermissionRow = {
  permission: string;
}

export async function getPermissionsForUser(user: User): Promise<string[]> {

  const query = "SELECT permission FROM user_permissions WHERE user_id = ?";
  const result = await db.query(query, [user.id]);
  
  return result[0].map( (row:PermissionRow) => {

    return row.permission;

  });

}

export async function hasPermission(user: User, permission: string): Promise<boolean> {

  const query = "SELECT id FROM user_permissions WHERE user_id = ? AND permission = ?";
  const result = await db.query(query, [user.id, permission]);

  return result[0].length === 1;

}
