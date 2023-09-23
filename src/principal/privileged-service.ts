import { LazyPrivilegeBox } from '../privilege/service';
import { Principal, PrincipalType, User, Group, App } from '../types';
import db from '../database';
import { PrincipalsRecord } from 'knex/types/tables';

/**
 * This class provides a wrapper around the principal service APIs.
 *
 * It ensures that the caller (the personal or app that's logged in) has
 * the appropriate privileges to read the associated data.
 */
export class PrivilegedPrincipalService {

  private privileges: LazyPrivilegeBox;

  constructor(actor: Principal | 'insecure') {
    
    this.privileges = new LazyPrivilegeBox(actor);

  }

  async findAll(type: 'user'): Promise<User[]>;
  async findAll(type: 'group'): Promise<Group[]>;
  async findAll(type: 'app'): Promise<App[]>;
  async findAll(): Promise<Principal[]>;
  async findAll(type?: PrincipalType): Promise<Principal[]> {

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

  async checkPrivilege(privilege: string, resource: string) {

    await this.privileges.ready();
    this.privileges.require(privilege, resource);

  }

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

export function recordToModel(user: PrincipalsRecord): Principal {

  return {
    id: user.id,
    href: `/${userTypeIntToUserType(user.type)}/${user.external_id}`,
    identity: user.identity,
    externalId: user.external_id,
    nickname: user.nickname!,
    createdAt: new Date(user.created_at),
    modifiedAt: new Date(user.modified_at),
    type: userTypeIntToUserType(user.type),
    active: !!user.active
  };

}
