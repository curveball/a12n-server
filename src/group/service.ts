import database from '../database';
import * as principalService from '../principal/service';
import { Principal, Group } from '../principal/types';

/**
 * Finding group members
 */

export async function findMembers(group: Group): Promise<Principal[]> {

  const query = `SELECT ${principalService.fieldNames.join(', ')} FROM principals INNER JOIN group_members ON principals.id = group_members.user_id WHERE group_id = ? ORDER BY nickname`;
  const result = await database.query(query, [group.id]);

  const models = [];

  for (const record of result) {
    const model = principalService.recordToModel(record);
    models.push(model);
  }

  return models;

}

export async function addMember(group: Group, user: Principal): Promise<void> {

  const query = 'INSERT INTO group_members SET group_id = ?, user_id = ?';
  await database.query(query, [group.id, user.id]);

}

export async function replaceMembers(group: Group, users: Principal[]): Promise<void> {

  const connection = await database.getConnection();
  await connection.transaction(async trx => {
    await trx.raw('DELETE FROM group_members WHERE group_id = ?', [group.id]);
    for(const user of users) {
      await trx.raw('INSERT INTO group_members SET group_id = ?, user_id = ?', [group.id, user.id]);
    }
    await trx.commit();
  });

}

export async function removeMember(group: Group, user: Principal): Promise<void> {

  const query = 'DELETE FROM group_members WHERE group_id = ? AND user_id = ?';
  await database.query(query, [group.id, user.id]);

}

/**
 * Finding group members
 */

export async function findGroupsForPrincipal(principal: Principal): Promise<Group[]> {

  const query = `SELECT ${principalService.fieldNames.join(', ')} FROM principals INNER JOIN group_members ON principals.id = group_members.group_id WHERE user_id = ?`;
  const result = await database.query(query, [principal.id]);

  const models: Group[] = [];

  for (const record of result) {
    const model = principalService.recordToModel(record);
    models.push(model as Group);
  }

  return models;

}
