import db from '../database';
import { User } from '../user/types';

type PrivilegeRow = {
  privilege: string;
};

export async function getPrivilegesForUser(user: User): Promise<string[]> {

  const query = 'SELECT privilege FROM user_privileges WHERE user_id = ?';
  const result = await db.query(query, [user.id]);

  return result[0].map( (row: PrivilegeRow) => {

    return row.privilege;

  });

}

export async function hasPermission(user: User, privilege: string): Promise<boolean> {

  const query = 'SELECT id FROM user_privileges WHERE user_id = ? AND privilege = ?';
  const result = await db.query(query, [user.id, privilege]);

  return result[0].length === 1;

}
