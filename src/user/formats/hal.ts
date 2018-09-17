import { User } from '../types';

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
      self: { href: '/user/' + user.id, title: user.nickname },
      me: { href: user.identity, title: user.nickname },
    },
    nickName: user.nickname,
    created: user.created,
    privileges
  };
  return hal;

}
