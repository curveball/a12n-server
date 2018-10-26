import { User, UserType } from '../types';

const TypeMap = new Map<UserType, string>([
  [UserType.user, 'user'],
  [UserType.app, 'app'],
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

export function item(user: User, privileges: string[]) {

  const hal: any = {
    _links: {
      "self": { href: '/user/' + user.id + '/log', title: user.nickname },
      "me": { href: user.identity, title: user.nickname },
      'auth-log': { href: '/user/' + user.id, title: 'Authentication log' },
    },
    nickName: user.nickname,
    created: user.created,
    type: TypeMap.get(user.type),
    privileges
  };
  return hal;

}
