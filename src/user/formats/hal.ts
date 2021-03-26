import { PrivilegeMap } from '../../privilege/types';
import { NewPrincipal, Principal, Group } from '../types';
import { HalResource } from 'hal-types';

export function collection(users: Principal[]): HalResource {

  const hal: HalResource = {
    _links: {
      'self': { href: '/user' },
      'item': users.map( user => ({
        href: '/user/' + user.id,
        title: user.nickname,
      })),
      'create-form': { href: '/create-user', title: 'Create New User'},
      'find-by-href': {
        title: 'Find a user through a identity/href (exact match)',
        href: '/user/byhref/{href}',
        templated: true,
      },
    },
    total: users.length,
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
export function item(user: Principal, privileges: PrivilegeMap, hasControl: boolean, hasPassword: boolean, isAdmin: boolean, groups: Group[]): HalResource {

  const hal: HalResource = {
    _links: {
      'self': {href: '/user/' + user.id, title: user.nickname },
      'me': { href: user.identity, title: user.nickname },
      'auth-log': { href: '/user/' + user.id + '/log', title: 'Authentication log', type: 'text/csv' },
      'up' : { href: '/user', title: 'List of users' },
      'group': groups.map( group => ({
        href: '/user/' + group.id,
        title: group.nickname,
      })),
    },
    nickname: user.nickname,
    active: user.active,
    created: user.created,
    type: user.type,
    privileges
  };

  if (user.type === 'group') {
    hal._links['member-collection'] = {
      href: '/user/' + user.id + '/member',
      title: 'Group Members'
    };
  }
  if (user.type === 'app') {
    hal._links['client-collection'] = {
      href: '/user/' + user.id + '/client',
      title: 'List of OAuth2 client credentials'
    };
  }
  if (user.type === 'user' && hasControl) {
    hal.hasPassword = hasPassword;
    hal._links['one-time-token'] = {
      href: '/user/' + user.id + '/one-time-token',
      title: 'Generate a one-time login token.',
      hints: {
        allow: ['POST'],
      }
    };
    hal._links['access-token'] = {
      href: '/user/' + user.id + '/access-token',
      title: 'Generate an access token for this user.',
    };
    hal._links['active-sessions'] = {
      href: `/user/${user.id}/sessions`,
      title: 'Active user sessions'
    };
  }
  if (isAdmin) {
    hal._links['password'] = {
      href: '/user/' + user.id + '/password',
      title: 'Change user\'s password',
      hints: {
        allow: ['PUT'],
      }
    };
  }
  return hal;

}

export function halToModel(body: any): NewPrincipal {

  return {
    identity: body._links.me.href,
    nickname: body.nickname,
    created: new Date(),
    type: body.type,
    active: body.active
  };

}
