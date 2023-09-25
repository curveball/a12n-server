import db from '../database';
import { App, User } from '../types';
import { UserAppPermission } from './types';
import { PrincipalService } from '../principal/service';
import { UserAppPermissionsRecord } from 'knex/types/tables';
import { NotFound } from '@curveball/http-errors';

/**
 * This function will set the permissions an app has on behalf of a user.
 *
 * If permissions already existed, the new list of permissions will be merged
 * with the old ones.
 */
export async function setPermissions(app: App, user: User, scope: string[]): Promise<void> {

  await db.transaction(async trx => {

    const userAppPermission = await trx('user_app_permissions')
      .first()
      .where({
        user_id: user.id,
        app_id: app.id
      })
      .forUpdate();

    if (!userAppPermission) {
      await trx('user_app_permissions').insert({
        app_id: app.id,
        user_id: user.id,
        scope: scope.length === 0 ? null : scope.join(' '),
        created_at: Date.now(),
        modified_at: Date.now(),
      });
    } else {
      const newScopes = new Set<string>([
        ...scope,
        ...(userAppPermission.scope ? userAppPermission.scope.split(' ') : []),
      ]);

      const newScopeStr = Array.from(newScopes).sort().join(' ');

      if (newScopeStr !== userAppPermission.scope) {
        await trx('user_app_permissions').update({
          scope: newScopes.size === 0 ? null : Array.from(newScopes).join(' '),
          modified_at: Date.now(),
        });
      }
    }

  });

}

/**
 * Returns all the apps the given user has granted permissions to
 */
export async function findByUser(user: User): Promise<UserAppPermission[]> {

  const principalService = new PrincipalService('insecure');
  const records = await db('user_app_permissions')
    .select()
    .where({user_id: user.id});

  const apps = await principalService.findMany(
    records.map(record => record.app_id)
  ) as Map<number, App>;

  return records.map( record => recordToModel(
    record,
    user,
    apps.get(record.app_id)!
  ));

}

/**
 * Returns all the apps the given user has granted permissions to
 */
export async function findByUserAndApp(user: User, app: App): Promise<UserAppPermission> {

  const record = await db('user_app_permissions')
    .first()
    .where({
      user_id: user.id,
      app_id: app.id,
    });

  if (!record) throw new NotFound(`User has not granted permission to app: ${app.href}`);

  return recordToModel(
    record,
    user,
    app
  );

}

/**
 * When an app generates an access token for a user, we update the lastUsedAt property.
 */
export async function updateLastUse(user: User, app: App): Promise<void> {

  await db('user_app_permissions')
    .update({last_used_at: Date.now()})
    .where({
      user_id: user.id,
      app_id: app.id
    });

}

function recordToModel(record: UserAppPermissionsRecord, user: User, app: App): UserAppPermission {

  return {
    app,
    user,
    scope: record.scope ? record.scope.split(' ') : [],
    createdAt: new Date(record.created_at),
    modifiedAt: new Date(record.modified_at),
    lastUsedAt: record.last_used_at === null ? null : new Date(record.last_used_at),
  };

}
