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

export async function findMembers(group: User): Promise<User[]> {

  const query = `SELECT ${UserService.fieldNames.join(', ')} FROM users INNER JOIN group_members ON users.id = group_members.user_id WHERE group_id = ?`;
  const result = await database.query(query, [group.id]);

  const models = [];

  for (const record of result[0]) {
    const model = UserService.recordToModel(record);
    models.push(model);
  }

  return models;

}

export async function addMemberToGroup(group: User, user: User): Promise<void> {

  const query = 'INSERT INTO group_members SET group_id = ?, user_id = ?';
  await database.query(query, [group.id, user.id]);

}

export async function replaceMembers(group: User, users: User[]): Promise<void> {

  const connection = await database.getConnection();
  await connection.beginTransaction();
  try {
    await connection.query('DELETE FROM group_members WHERE group_id = ?', [group.id]);
    for(const user of users) {
      await connection.query('INSERT INTO group_members SET group_id = ?, user_id = ?', [group.id, user.id]);
    }
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

}
