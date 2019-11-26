import database from '../database';
import { User } from '../user/types';
import { GroupMember } from './types';

type GroupMemberRecord = {
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

  const query = 'SELECT type FROM users WHERE id = ? AND type = 3';
  const result = await database.query(query, [user.id]);

  if (!result[0].length) {
    return false;
  }

  return true;
}

/**
 * Finding group memeber
 */

export async function findAllGroupMemebers(group: GroupMember): Promise<GroupMember[]> {

  const query = `SELECT ${fieldNames.join(', ')} FROM users INNER JOIN group_members ON users.id = group_members.user_id WHERE group_id = ?`;
  const result = await database.query(query, [group.id]);

  const models = [];

  for (const record of result[0]) {
    const model = recordToModel(group, record);
    models.push(model);
  }

  return models;

}


function recordToModel(group: GroupMember, record: GroupMemberRecord): GroupMember {

  return {
    id: record.id,
    identity: record.identity,
    nickname: record.nickname,
    created: new Date(record.created * 1000),
    active: !!record.active,
    type: record.type
  };

}
