import { HalLink, HalResource } from 'hal-types';
import { UserNewResult, User as UserHal } from '../../api-types.ts';
import { LazyPrivilegeBox } from '../../privilege/service.ts';
import { PrivilegeMap } from '../../privilege/types.ts';
import { Group, PaginatedResult, Principal, PrincipalIdentity, User, UserInfo } from '../../types.ts';

export function collection(paginatedResult: PaginatedResult<User>, embeddedUsers: HalResource[]): HalResource {

  const { items: users, page: currentPage, total, pageSize, hasNextPage } = paginatedResult;

  const totalPages = Math.ceil(total / pageSize);

  const links: Record<string, HalLink|HalLink[]> = {
    'self': getUserPageHref(currentPage),
    'item': users.map( user => ({
      href: user.href,
      title: user.nickname,
    })),
    'create-form': { href: '/user/new', title: 'Create New User', type: 'text/html'},
    'find-by-href': {
      title: 'Find a user through a identity/href (exact match)',
      href: '/user/byhref/{href}',
      templated: true,
    }
  };

  if(hasNextPage){
    const nextPage = currentPage + 1;
    links['next'] = getUserPageHref(nextPage);
  }

  const hasPrevPage = currentPage > 1;
  if(hasPrevPage){
    const prevPage = currentPage - 1;
    links['previous'] = getUserPageHref(prevPage);
  }
  if(hasNextPage || hasPrevPage){
    links['first'] = getUserPageHref(1);
    links['last'] = getUserPageHref(totalPages);
  }
  const hal: HalResource = {
    _links: links,
    total,
    currentPage,
    totalPages,
  };

  if (embeddedUsers.length) {
    hal._embedded = {
      item: embeddedUsers
    };
  }

  return hal;

}

function getUserPageHref(page: number): HalLink {
  if(page === 1){
    return { href: '/user' };
  }

  return { href: `/user?page=${page}` };
}

/**
 * Generate a HAL response for a specific user
 *
 * hasControl should only be true if the *current* user is same as the user
 * we're generating the repsonse for, or if the current authenticated user
 * has full admin privileges
 */
export function item(user: User, privileges: PrivilegeMap, hasControl: boolean, currentUserPrivileges: LazyPrivilegeBox, groups: Group[], identities: PrincipalIdentity[], userInfo: UserInfo): HalResource<UserHal> {

  const links: Record<string, HalLink|HalLink[]> = {
    'self': {href: user.href, title: user.nickname },
    'me': identities.map( identity => (
      { href: identity.uri, title: user.nickname ?? undefined }
    )),
    'auth-log': { href: `${user.href}/log`, title: 'Authentication log', type: 'text/csv' },
    'up' : { href: '/user', title: 'List of users' },
    'group': groups.map( group => ({
      href: group.href,
      title: group.nickname,
    })),
    'describedby': {
      href: 'https://curveballjs.org/schemas/a12nserver/user.json',
      type: 'application/schema+json',
    }
  };

  if (hasControl || currentUserPrivileges.has('a12n:one-time-token:generate')) {
    links['one-time-token'] = {
      href: `${user.href}/one-time-token`,
      title: 'Generate a one-time login token.',
      hints: {
        allow: ['POST'],
      }
    };
  }

  if (hasControl || currentUserPrivileges.has('a12n:access-token:generate', user.href)) {
    links['access-token'] = {
      href: `${user.href}/access-token`,
      title: 'Generate an access token for this user.',
      hints: {
        allow: ['POST'],
      }
    };

  }
  if (hasControl || currentUserPrivileges.has('a12n:user:manage-identities', user.href)) {
    links['identity-collection'] = {
      href: `${user.href}/identity`,
      title: 'List of identities the user is associated with'
    };
  }

  if (hasControl || currentUserPrivileges.has('a12n:user:manage-auth-factors', user.href)) {
    links['auth-factor-collection'] = {
      href: `${user.href}/auth-factor`,
      title: 'List of authentication methods / authentication factors for a user',
    };
  }

  if (hasControl) {
    links['active-sessions'] = {
      href: `${user.href}/sessions`,
      title: 'Active user sessions'
    };
    links['app-permission-collection'] = {
      href: `${user.href}/app-permission`,
      title: 'App Permissions',
    };
    links['edit-form'] = {
      href: `${user.href}/edit`,
      title: `Edit ${user.nickname}`
    };

    links['privileges'] = {
      href: `${user.href}/edit/privileges`,
      title: 'Change privilege policy',
    };
  }
  if (currentUserPrivileges.has('a12n:user:change-password', user.href)) {
    links['password'] = {
      href: `${user.href}/password`,
      title: 'Change user\'s password',
      hints: {
        allow: ['PUT'],
      }
    };
  }
  return {
    _links: links,
    nickname: user.nickname,
    active: user.active,
    createdAt: user.createdAt.toISOString(),
    modifiedAt: user.modifiedAt.toISOString(),
    type: user.type,
    privileges,
    ...userInfo,
  };

}

export function edit(user: User): HalResource {
  return {
    _links: {
      self: {
        href: `${user.href}/edit`,
      },
      up: {
        href: user.href,
        title: 'Cancel',
      },
    },
    _templates: {
      default: {
        title: 'Edit User',
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        properties: [
          {
            name: 'nickname',
            prompt: 'Nickname',
            type: 'text',
            value: user.nickname,
          },

          {
            name: 'active',
            prompt: 'Active',
            options: {
              inline: [
                { prompt: 'Activated', value: 'true' },
                { prompt: 'Deactivated', value: 'false' },
              ],
            },
            value: user.active ? 'true' : 'false',
          },
        ],
      },
    },
  };
}

export function editPrivileges(principal: Principal, userPrivileges: PrivilegeMap, privileges: string[]): HalResource {
  return {
    _links: {
      self: {
        href: `${principal.href}/edit/privileges`,
        title: `Edit privileges for ${principal.nickname}`,
      },
      up: {
        href: principal.href,
        title: 'Cancel',
      },
    },
    _templates: {
      edit: {
        title: `Edit privilege policy for ${principal.nickname}`,
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        properties: [
          {
            name: 'policyBody',
            prompt: 'Privilege Policy',
            type: 'textarea',
            cols: 100,
            rows: 20,
            value: JSON.stringify(userPrivileges, undefined, 2),
          },
        ],
      },
      add: {
        title: 'Add a single privilege',
        method: 'PATCH',
        contentType: 'application/json',
        target: `${principal.href}/edit/privileges`,
        properties: [
          {
            name: 'privilege',
            prompt: 'Privilege',
            required: true,
            options: {
              inline: privileges
            }
          },
          {
            name: 'resource',
            prompt: 'Resource (uri)',
            required: true,
            type: 'url',
            placeholder: 'https://my-api/resource/foo',
          },
          {
            name: 'action',
            type: 'hidden',
            value: 'add'
          }
        ],
      },
    },
  };
}


/**
 * Generate a HAL response after new user creation.
 *
 * hasControl should only be true if the *current* user is same as the user
 * we're generating the repsonse for, or if the current authenticated user
 * has full admin privileges
 */
export function newUserResult(user: User, password: string|null, identities: PrincipalIdentity[]): HalResource<UserNewResult> {

  const hal: HalResource<UserNewResult> = {
    _links: {
      'self': {href: user.href, title: user.nickname },
      'me': identities.map( identity => (
        { href: identity.uri, title: user.nickname ?? undefined }
      )),
      'describedby': {
        href: 'https://curveballjs.org/schemas/a12nserver/user-new-result.json',
        type: 'application/schema+json',
      }
    },
    nickname: user.nickname,
    active: user.active,
    password: password ?? undefined,
    createdAt: user.createdAt.toISOString(),
    modifiedAt: user.modifiedAt.toISOString(),
    type: user.type
  };

  return hal;

}
