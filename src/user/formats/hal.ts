import { User } from '../types';

export function collection(users: User[]) {

  const hal:any = {
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


export function item(user: User) {

  const hal:any = {
    _links: {
      self: { href: '/user/' + user.id, title: user.nickname },
      me: { href: user.identity },
    },
    nickName: user.nickname,
    created: user.created,
  };
  return hal;

}
