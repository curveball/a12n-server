import database from '../database';
import { User } from '../user/types';

type GroupRecord = {
  id: number,
  identity: string,
  nickname: string,
  created: number,
  active: number,
  type: number
};

const fieldNames = [
  'id',
  'identity',
  'nickname',
  'created',
  'active',
  'type'
];

/**
 *  Checks if the user is a type group and returns true or false
 */
export async function isGroup(user: User): Promise<boolean> {

  const query = `SELECT ${fieldNames.join(', ')} FROM users WHERE id = ? AND type = 3`;
  const result = await database.query(query, [user.id]);

  if (!result[0].length) {
    return false;
  }

  return true;
}

/**
 * Finding group memeber
 */

export async function findAllGroupMembers(user: User): Promise<User[]> {

  const query = `SELECT ${fieldNames.join(', ')} FROM users INNER JOIN group_members ON users.id = group_members.user_id WHERE group_id = ?`;
  const result = await database.query(query, [user.id]);

  const models = [];

  for (const record of result[0]) {
    const model = recordToModel(user, record);
    models.push(model);
  }

  return models;

}


function recordToModel(user: User, record: GroupRecord): User {

  return {
    id: record.id,
    identity: record.identity,
    nickname: record.nickname,
    created: new Date(record.created * 1000),
    active: !!record.active,
    type: record.type
  };

}
