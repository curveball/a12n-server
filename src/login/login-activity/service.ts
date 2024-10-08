import { NotFound } from '@curveball/http-errors';
import { UserLoginActivityRecord } from 'knex/types/tables.js';
import db from '../../database.js';
import { User } from '../../types.js';

const MAX_FAILED_ATTEMPTS = 5;

export function reachedMaxAttempts(attempts: number) {
  return attempts >= MAX_FAILED_ATTEMPTS;
}

async function getLoginActivity(user: User): Promise<UserLoginActivityRecord> {
  const loginActivity = await db<UserLoginActivityRecord>('user_login_activity')
    .where({ principal_id: user.id })
    .first();

  if (!loginActivity) throw new NotFound(`Login activity record for user with ID ${user.id} was not found.`);

  return loginActivity;
}

async function ensureUserLoginActivityRecord(user: User): Promise<void> {
  await db('user_login_activity')
    .insert({
      principal_id: user.id,
      failed_login_attempts: 0,
      account_locked: 0,
    })
    .onConflict('principal_id')
    .ignore();
}

export async function incrementFailedLoginAttempts(user: User): Promise<number> {
  await ensureUserLoginActivityRecord(user);

  return await db.transaction(async (trx) => {

    const loginActivity = await trx('user_login_activity')
      .where({ principal_id: user.id })
      .forUpdate()
      .first();

    const newAttempts = loginActivity!.failed_login_attempts + 1;

    await trx('user_login_activity')
      .where({ principal_id: user.id })
      .update({
        failed_login_attempts: newAttempts,
        account_locked: newAttempts >= MAX_FAILED_ATTEMPTS ? 1 : 0,
      });

    return newAttempts;
  });
}

export async function resetFailedLoginAttempts(user: User): Promise<void> {
  await db('user_login_activity')
    .where({ principal_id: user.id })
    .update({
      failed_login_attempts: 0,
      account_locked: 0,
    });
}

export async function isAccountLocked(user: User): Promise<boolean> {
  await ensureUserLoginActivityRecord(user);

  const loginActivity = await getLoginActivity(user);
  return !!loginActivity.account_locked;
}
