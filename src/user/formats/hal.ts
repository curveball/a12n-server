import { PrivilegeMap } from '../../privilege/types';
import { NewUser, User } from '../types';
import { HalResource } from 'hal-types';

export function collection(users: User[]): HalResource {

  const hal: HalResource = {
    _links: {
      'self': { href: '/user' },
      'item': users.map( user => ({
        href: '/user/' + user.id,
        title: user.nickname,
      })),
      'create-form': { href: '/create-user', title: 'Create New User'}
    },
    total: users.length,
  };

  return hal;

}

export function item(user: User, privileges: PrivilegeMap): HalResource {

  const hal: HalResource = {
    _links: {
      'self': {href: '/user/' + user.id, title: user.nickname },
      'me': { href: user.identity, title: user.nickname },
      'auth-log': { href: '/user/' + user.id + '/log', title: 'Authentication log', type: 'text/csv' },
      'up' : { href: '/user', title: 'List of users' },
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
  if (user.type === 'user') {
    hal._links['one-time-token'] = {
      href: '/user/' + user.id + '/one-time-token',
      title: 'Generate a one-time login token.',
      hints: {
        allow: ['POST'],
      }
    };
  }

  return hal;

}

export function halToModel(body: any): NewUser {

  return {
    identity: body._links.me.href,
    nickname: body.nickname,
    created: new Date(),
    type: body.type,
    active: body.active
  };

}
