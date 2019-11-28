import database from '../database';
import * as UserService from '../user/service';
import { User, UserType } from '../user/types';

/**
 *  Checks if the user is a type group and returns true or false
 */
export async function isGroup(user: User): Promise<boolean> {

  if (user.type !== UserType.group) {
    return false;
  }

  return true;

}

/**
 * Finding group members
 */

export async function findAllGroupMembers(user: User): Promise<User[]> {

  const query = `SELECT ${UserService.fieldNames.join(', ')} FROM users INNER JOIN group_members ON users.id = group_members.user_id WHERE group_id = ?`;
  const result = await database.query(query, [user.id]);

  const models = [];

  for (const record of result[0]) {
    const model = recordToModel(user, record);
    models.push(model);
  }

  return models;

}


function recordToModel(user: User, record: UserService.UserRecord): User {

  return {
    id: record.id,
    identity: record.identity,
    nickname: record.nickname,
    created: new Date(record.created * 1000),
    active: !!record.active,
    type: record.type
  };

}
