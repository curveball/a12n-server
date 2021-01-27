import database from '../database';
import * as UserService from '../user/service';
import { User } from '../user/types';
import { NotFound } from '@curveball/http-errors/dist';
import { GroupMember } from './type';

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

export async function findUserFromGroup(userId: number): Promise<any> {

  const query = 'SELECT * FROM group_members WHERE user_id = ?';
  const result = await database.query(query, [userId]);

  if (result[0].length !== 1) {
    throw new NotFound(`Can't find group member with User ID ${userId}`);
  }

}

export async function update(groupMember: GroupMember): Promise<void> {
  const query = `UPDATE group_members SET ? WHERE group_id = ?`;

  await database.query(query, [groupMember.userId, groupMember.groupId]);
}

export async function addMemberToGroup (userId: string, group: User): Promise<void> {

  const query = `INSERT INTO group_members SET group_id = ?, user_id = ?`;

  await database.query(query, [group.id, userId]);

}
