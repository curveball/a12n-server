import { PrivilegeMap } from '../../privilege/types';
import { NewUser, User, UserType } from '../types';

const TypeMap = new Map<UserType, string>([
  [UserType.user, 'user'],
  [UserType.app, 'app'],
  [UserType.group, 'group'],
]);

export const TypeMapInt = new Map<string, UserType>([
  ['user', UserType.user],
  ['app', UserType.app],
  ['group', UserType.group],
]);

export function collection(users: User[]) {

  const hal: any = {
    _links: {
      self: { href: '/user' },
      item: [],
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
      'self': { href: '/user/' + user.id, title: user.nickname },
      'me': { href: user.identity, title: user.nickname },
      'auth-log': { href: '/user/' + user.id + '/log', title: 'Authentication log', type: 'text/csv' },
    },
    nickname: user.nickname,
    created: user.created,
    type: TypeMap.get(user.type),
    privileges
  };

  if (user.type === UserType.group) {
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
    type: TypeMapInt.get(body.type),
    active: body.active
  };

}
