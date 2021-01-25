import database from '../database';
import * as UserService from '../user/service';
import { User } from '../user/types';


/**
 *  Checks if the user is a type group and returns true or false
 */
export function isGroup(user: User): boolean {

  return user.type === 'group';

}

/**
 * Finding group members
 */

export async function findAllGroupMembers(user: User): Promise<User[]> {

  const query = `SELECT ${UserService.fieldNames.join(', ')} FROM users INNER JOIN group_members ON users.id = group_members.user_id WHERE group_id = ?`;
  const result = await database.query(query, [user.id]);

  const models = [];

  for (const record of result[0]) {
    const model = UserService.recordToModel(record);
    models.push(model);
  }

  return models;

}

export async function save (userId: string, group: User) {

  const query = `INSERT INTO group_members SET group_id = ${group.id}, user_id = ?`;

  const result = await database.query(query, [userId]);

  return result;

}
