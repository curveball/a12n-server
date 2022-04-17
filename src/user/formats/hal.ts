import { PrivilegeMap } from '../../privilege/types';
import { Principal, Group, User } from '../../principal/types';
import { HalResource } from 'hal-types';

export function collection(users: User[]): HalResource {

  const hal: HalResource = {
    _links: {
      'self': { href: '/user' },
      'item': users.map( user => ({
        href: user.href,
        title: user.nickname,
      })),
      'create-form': { href: '/create-user', title: 'Create New User'},
      'find-by-href': {
        title: 'Find a user through a identity/href (exact match)',
        href: '/user/byhref/{href}',
        templated: true,
      },
    },
    total: users.length
  };

  return hal;

}

/**
 * Generate a HAL response for a specific user
 *
 * hasControl should only be true if the *current* user is same as the user
 * we're generating the repsonse for, or if the current authenticated user
 * has full admin privileges
 */
export function item(user: User, privileges: PrivilegeMap, hasControl: boolean, hasPassword: boolean, isAdmin: boolean, groups: Group[]): HalResource {

  const hal: HalResource = {
    _links: {
      'self': {href: user.href, title: user.nickname },
      'me': { href: user.identity, title: user.nickname },
      'auth-log': { href: `${user.href}/log`, title: 'Authentication log', type: 'text/csv' },
      'up' : { href: '/user', title: 'List of users' },
      'group': groups.map( group => ({
        href: group.href,
        title: group.nickname,
      })),
    },
    nickname: user.nickname,
    active: user.active,
    createdAt: user.createdAt,
    modifiedAt: user.modifiedAt,
    type: user.type,
    privileges
  };

  if (hasControl) {
    hal.hasPassword = hasPassword;
    hal._links['one-time-token'] = {
      href: `${user.href}/one-time-token`,
      title: 'Generate a one-time login token.',
      hints: {
        allow: ['POST'],
      }
    };
    hal._links['access-token'] = {
      href: `${user.href}/access-token`,
      title: 'Generate an access token for this user.',
    };
    hal._links['active-sessions'] = {
      href: `${user.href}/sessions`,
      title: 'Active user sessions'
    };
  }
  if (isAdmin) {
    hal._links['password'] = {
      href: `${user.href}/password`,
      title: 'Change user\'s password',
      hints: {
        allow: ['PUT'],
      }
    };

    hal._links['edit-form'] = {
      href: `${user.href}/edit`,
      title: `Edit ${user.nickname}`
    };

    hal._links['privileges'] = {
      href: `${user.href}/edit/privileges`,
      title: 'Change privilege policy',
    };
  }

  return hal;

}

export function edit(user: Principal): HalResource {
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
            name: 'identity',
            prompt: 'Identity',
            type: 'text',
            value: user.identity,
          },
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

export function editPrivileges(user: Principal, privileges: PrivilegeMap): HalResource {
  return {
    _links: {
      self: {
        href: `${user.href}/edit/privileges`,
      },
      up: {
        href: user.href,
        title: 'Cancel',
      },
    },
    _templates: {
      default: {
        title: `Edit privilege policy for ${user.nickname}`,
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        properties: [
          {
            name: 'policyBody',
            prompt: 'Privilege Policy',
            type: 'textarea',
            cols: 100,
            rows: 20,
            value: JSON.stringify(privileges, undefined, 2),
          },
        ],
      },
    },
  };
}
