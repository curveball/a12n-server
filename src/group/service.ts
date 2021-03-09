import database from '../database';
import * as UserService from '../user/service';
import { Principal, Group } from '../user/types';

export function isGroup(principal: Principal): principal is Group {

  return principal.type === 'group';

}

/**
 * Finding group members
 */

export async function findMembers(group: Group): Promise<Principal[]> {

  const query = `SELECT ${UserService.fieldNames.join(', ')} FROM users INNER JOIN group_members ON users.id = group_members.user_id WHERE group_id = ?`;
  const result = await database.query(query, [group.id]);

  const models = [];

  for (const record of result[0]) {
    const model = UserService.recordToModel(record);
    models.push(model);
  }

  return models;

}

export async function addMemberToGroup(group: Group, user: Principal): Promise<void> {

  const query = 'INSERT INTO group_members SET group_id = ?, user_id = ?';
  await database.query(query, [group.id, user.id]);

}

export async function replaceMembers(group: Group, users: Principal[]): Promise<void> {

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

/**
 * Finding group members
 */

export async function findGroupsForPrincipal(principal: Principal): Promise<Group[]> {

  const query = `SELECT ${UserService.fieldNames.join(', ')} FROM users INNER JOIN group_members ON users.id = group_members.user_id WHERE user_id = ?`;
  const result = await database.query(query, [principal.id]);

  const models: Group[] = [];

  for (const record of result[0]) {
    const model = UserService.recordToModel(record);
    models.push(model as Group);
  }

  return models;

}
