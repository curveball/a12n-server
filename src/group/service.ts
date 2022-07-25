import db, { query } from '../database';
import * as principalService from '../principal/service';
import { Principal, Group } from '../principal/types';

/**
 * Finding group members
 */

export async function findMembers(group: Group): Promise<Principal[]> {

  const result = await query(
    `SELECT ${principalService.fieldNames.join(', ')} FROM principals INNER JOIN group_members ON principals.id = group_members.user_id WHERE group_id = ? ORDER BY nickname`,
    [group.id]
  );

  const models = [];

  for (const record of result) {
    const model = principalService.recordToModel(record);
    models.push(model);
  }

  return models;

}

export async function addMember(group: Group, user: Principal): Promise<void> {

  const query = 'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)';
  await db.raw(query, [group.id, user.id]);

}

export async function replaceMembers(group: Group, users: Principal[]): Promise<void> {

  await db.transaction(async trx => {
    await trx.raw('DELETE FROM group_members WHERE group_id = ?', [group.id]);
    for(const user of users) {
      await trx.raw('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [group.id, user.id]);
    }
    await trx.commit();
  });

}

export async function removeMember(group: Group, user: Principal): Promise<void> {

  const query = 'DELETE FROM group_members WHERE group_id = ? AND user_id = ?';
  await db.raw(query, [group.id, user.id]);

}

/**
 * Finding group members
 */

export async function findGroupsForPrincipal(principal: Principal): Promise<Group[]> {

  const result = await query(
    `SELECT ${principalService.fieldNames.join(', ')} FROM principals INNER JOIN group_members ON principals.id = group_members.group_id WHERE user_id = ?`,
    [principal.id]
  );

  const models: Group[] = [];

  for (const record of result) {
    const model = principalService.recordToModel(record);
    models.push(model as Group);
  }

  return models;

}
