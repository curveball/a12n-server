import { LazyPrivilegeBox } from '../privilege/service';
import {
  App,
  BasePrincipal,
  Group,
  NewPrincipal,
  Principal,
  PrincipalStats,
  PrincipalType,
  User,
} from '../types';
import db, {insertAndGetId} from '../database';
import { PrincipalsRecord } from 'knex/types/tables';
import {
  NotFound,
  UnprocessableEntity,
} from '@curveball/http-errors';
import { generatePublicId } from '../crypto';

/**
 * This class provides a wrapper around the principal service APIs.
 *
 * It ensures that the caller (the personal or app that's logged in) has
 * the appropriate privileges to read the associated data.
 */
export class PrincipalService {

  private privileges: LazyPrivilegeBox;

  /**
   * Set up the principal service.
   *
   * You must pass the privileges for the current user, so we can check if
   * the user is allowed to perform the requests.
   *
   * If the string 'insecure' is passed, no privileges will be checked.
   */
  constructor(privileges: LazyPrivilegeBox|'insecure') {

    if (privileges === 'insecure') {
      this.privileges = new LazyPrivilegeBox(privileges);
    } else {
      this.privileges = privileges;
    }

  }

  async findAll(type: 'user'): Promise<User[]>;
  async findAll(type: 'group'): Promise<Group[]>;
  async findAll(type: 'app'): Promise<App[]>;
  async findAll(): Promise<Principal[]>;
  async findAll(type?: PrincipalType): Promise<Principal[]> {

    this.privileges.require('a12n:principals:list');
    const filters: Record<string, any> = {};
    if (type) {
      filters.type = userTypeToInt(type);
    }

    const result = await db('principals')
      .where(filters);

    const principals: Principal[] = [];
    for (const principal of result) {
      principals.push(recordToModel(principal));
    }
    return principals;

  }

  async findByIdentity(identity: string): Promise<Principal> {

    this.privileges.require('a12n:principals:list');
    const result = await db('principals')
      .where({identity})
      .first();

    if (!result) {
      throw new NotFound(`Principal with identity: ${identity} not found`);
    }

    return recordToModel(result);

  }

  async save<T extends PrincipalType>(principal: BasePrincipal<T>|NewPrincipal<T> ): Promise<BasePrincipal<T>> {

    if (!isExistingPrincipal(principal)) {

      this.privileges.require('a12n:principals:create');
      const externalId = await generatePublicId();

      const newPrincipalsRecord: Omit<PrincipalsRecord, 'id'> = {
        identity: principal.identity,
        external_id: externalId,
        nickname: principal.nickname,
        type: userTypeToInt(principal.type),
        active: principal.active ? 1 : 0,
        modified_at: Date.now(),
        created_at: Date.now(),
        system: 0,
      };

      const result = await insertAndGetId('principals', newPrincipalsRecord);

      return {
        id: result,
        href: `/${principal.type}/${externalId}`,
        externalId,
        system: false,
        ...principal,
      };

    } else {

      // Update user
      this.privileges.require('a12n:principals:update', principal.href);
      if (!isIdentityValid(principal.identity)) {
        throw new UnprocessableEntity('Identity must be a valid URI');
      }

      principal.modifiedAt = new Date();

      const updatePrincipalsRecord: Omit<PrincipalsRecord, 'id' | 'created_at' | 'type' | 'external_id' | 'system'> = {
        identity: principal.identity,
        nickname: principal.nickname,
        active: principal.active ? 1 : 0,
        modified_at: principal.modifiedAt.getTime(),
      };


      await db('principals')
        .where('id', principal.id)
        .update(updatePrincipalsRecord);

      return principal;

    }
  }
  async findByExternalId(externalId: string, type: 'user'): Promise<User>;
  async findByExternalId(externalId: string, type: 'group'): Promise<Group>;
  async findByExternalId(externalId: string, type: 'app'): Promise<App>;
  async findByExternalId(externalId: string): Promise<Principal>;
  async findByExternalId(externalId: string, type?: PrincipalType): Promise<Principal> {

    let result = await db('principals')
      .select()
      .where({external_id: externalId})
      .first();

    if (!result && +(externalId)>0) {
      // Trying to find the principal but now use the id field
      result = await db('principals')
        .select()
        .where({id: +externalId})
        .first();

      if (!result) {
        throw new NotFound(`Principal with id: ${externalId} not found`);
      }
    }


    const principal = recordToModel(result as PrincipalsRecord);

    if (!this.privileges.isPrincipal(principal)) this.privileges.require('a12n:principals:list');

    if (type && principal.type !== type) {
      throw new NotFound(`Principal with id ${externalId} does not have type ${type}`);
    }
    return principal;

  }

  /**
   * Finds a principal by its href'.
   *
   * This can be a string like /user/1, or a full url.
   * It can also be the uri listed in the 'identity' field.
   */
  async findByHref(href: string): Promise<Principal> {

    this.privileges.require('a12n:principals:list');
    const pathName = getPathName(href);
    const matches = pathName.match(/^\/(user|app|group)\/([0-9a-zA-Z_-]+)$/);

    if (!matches) {
      return this.findByIdentity(href);
    }

    let typeFilter;
    switch(matches[1] as 'user' | 'app' | 'group') {
      case 'user' :
        // Backwards compatibility
        typeFilter = [1,2,3];
        break;
      case 'app' :
        typeFilter = [2];
        break;
      case 'group' :
        // Backwards compatibility
        typeFilter = [3];
        break;
    }

    const result = await db('principals')
      .select()
      .whereIn('type', typeFilter)
      .andWhere({external_id: matches[2]})
      .first();

    if (!result) {
      throw new NotFound('Principal with href: ' + href + ' not found');
    }

    return recordToModel(result);
  }

  /**
   * Find multiple principals.
   *
   * This function returns the principals as a map, index by their id.
   * This is a helper function typically used by other services to find large numbers
   * of joined principals from other tables fast.
   *
   * If any of the ids in the list is duplicated, they are de-duplicated here.
   * if any of the provided ids are not found, this function will error.
   */
  async findMany(ids: number[]): Promise<Map<number,Principal>> {

    this.privileges.require('a12n:principals:list');
    const records = await db('principals')
      .select()
      .whereIn('id', ids);

    const result = new Map<number, Principal>(records.map(
      record => [record.id, recordToModel(record)]
    ));

    for (const id of ids) {
      if (!result.has(id)) {
        throw new NotFound(`Principal with ${id} not found`);
      }
    }

    return result;

  }

  async findById(id: number, type: 'user'): Promise<User>;
  async findById(id: number, type: 'group'): Promise<Group>;
  async findById(id: number, type: 'app'): Promise<App>;
  async findById(id: number): Promise<Principal>;
  async findById(id: number, type?: PrincipalType): Promise<Principal> {

    this.privileges.require('a12n:principals:list');
    const result = await db('principals')
      .select()
      .where({id});

    if (result.length !== 1) {
      throw new NotFound(`Principal with id: ${id} not found`);
    }

    const principal = recordToModel(result[0]);

    if (type && principal.type !== type) {
      throw new NotFound(`Principal with id ${id} does not have type ${type}`);
    }
    return principal;

  }

  /**
   * Returns the list of members of a group
   */
  async findMembers(group: Group): Promise<Principal[]> {

    this.privileges.require('a12n:principals:list');

    const result = await db('principals')
      .select('principals.*')
      .innerJoin('group_members', { 'principals.id': 'group_members.user_id'})
      .where({group_id: group.id})
      .orderBy('nickname');

    const models = [];

    for (const record of result) {
      const model = recordToModel(record);
      models.push(model);
    }

    return models;

  }

  async addMember(group: Group, user: Principal): Promise<void> {

    this.privileges.require('admin');

    await db('group_members').insert({
      group_id: group.id,
      user_id: user.id
    });

  }

  async replaceMembers(group: Group, users: Principal[]): Promise<void> {

    this.privileges.require('admin');
    await db.transaction(async trx => {
      await trx('group_members')
        .delete()
        .where({
          group_id: group.id
        });

      for(const user of users) {
        await trx('groupmembers')
          .insert({
            group_id: group.id,
            user_id: user.id
          });
      }
      await trx.commit();
    });

  }

  async removeMember(group: Group, user: Principal): Promise<void> {

    this.privileges.require('admin');
    await db('group_members')
      .delete()
      .where({
        group_id: group.id,
        user_id: user.id,
      });

  }

  /**
   * Returns a list of groups for which the principal is a member
   */
  async findGroupsForPrincipal(principal: Principal): Promise<Group[]> {

    this.privileges.require('admin');
    const result = await db('principals')
      .select('principals.*')
      .innerJoin('group_members', { 'principals.id': 'group_members.group_id'})
      .where({user_id: principal.id})
      .orderBy('nickname');

    const models: Group[] = [];

    for (const record of result) {
      const model = recordToModel(record);
      models.push(model as Group);
    }

    return models;

  }

}
/**
 * Returns true if more than 1 principal exists in the system.
 *
 * If there are 0 principals, this puts a12nserver in setup mode, which allows a
 * person to create the first user in the system, automatically activate it
 * and make them an admin.
 */
export async function hasUsers(): Promise<boolean> {

  const result = await db('principals')
    .select('id')
    .where({type: 1})
    .first();
  return !!result;

}
export function isIdentityValid(identity: string): boolean {

  const regex = /^(?:[A-Za-z]+:\S*$)?/;
  return regex.test(identity);

}
export async function getPrincipalStats(): Promise<PrincipalStats> {

  const result = await db<any>('principals')
    .select(['type', db.raw('COUNT(*) as total')])
    .groupBy('type');

  const principalStats: Record<PrincipalType, number> = {
    user: 0,
    app: 0,
    group: 0
  };

  for (const principal of result) {
    principalStats[userTypeIntToUserType(principal.type)] = principal.total;
  }

  return principalStats;

}


function recordToModel(user: PrincipalsRecord): Principal {

  return {
    id: user.id,
    href: `/${userTypeIntToUserType(user.type)}/${user.external_id}`,
    identity: user.identity,
    externalId: user.external_id,
    nickname: user.nickname!,
    createdAt: new Date(user.created_at),
    modifiedAt: new Date(user.modified_at),
    type: userTypeIntToUserType(user.type),
    active: !!user.active,
    system: !!user.system,
  };

}

function isExistingPrincipal(user: Principal | NewPrincipal<any>): user is Principal {

  return (user as Principal).id !== undefined;

}

function userTypeToInt(input: PrincipalType): number {

  switch (input) {
    case 'user': return 1;
    case 'app': return 2;
    case 'group': return 3;
  }

}

function userTypeIntToUserType(input: number): PrincipalType {

  switch (input) {
    case 1: return 'user';
    case 2: return 'app';
    case 3: return 'group';
    default:
      throw new Error('Unknown user type id: ' + input);
  }

}

function getPathName(href: string): string {

  let url;

  try {
    url = new URL(href);
  } catch {
    return href;
  }
  return url.pathname;

}
