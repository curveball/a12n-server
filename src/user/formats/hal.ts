import { PrivilegeMap } from '../../privilege/types';
import { NewUser, User } from '../types';

export function collection(users: User[]) {

  const hal: any = {
    _links: {
      'self': { href: '/user' },
      'item': [],
      'create-form': { href: '/create-user', title: 'Create New User'}
    },
    total: users.length,
  };

  for (const user of users) {
    hal._links.item.push({
      href: '/user/' + user.id,
      title: user.nickname,
    });
  }
  return hal;

}

export function item(user: User, privileges: PrivilegeMap) {
  const hal: any = {
    _links: {
      'self': {href: '/user/' + user.id, title: user.nickname },
      'me': { href: user.identity, title: user.nickname },
      'auth-log': { href: '/user/' + user.id + '/log', title: 'Authentication log', type: 'text/csv' }
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
