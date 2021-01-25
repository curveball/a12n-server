import { User } from '../../user/types';

export function collection(user: User, members: User[] ) {

  const hal: any = {
    _links: {
      self: {
        href: '/user/' + user.id + '/member',
        title: user.nickname + ' members'
      },
      'create-form': {
        href: `/user/${user.id}/member/new`,
        title: 'Add new member to group'
      },
      item: [],
    },
    total: members.length,
  };

  for (const member of members) {
    hal._links.item.push({
      href: '/user/' + member.id,
      title: member.nickname,
    });
  }

  return hal;

}
