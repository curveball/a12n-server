import { User } from '../../user/types';
import { GroupMember } from '../types';

export function collection(user: User, group: GroupMember[]) {

  const hal: any = {
    _links: {
      self: {
        href: '/user/' + user.id + '/member',
        title: user.nickname + ' members'
      },
      members: [],
    },
    total: group.length,
  };

  for (const member of group) {
    hal._links.members.push({
      href: '/user/' + member.id,
      title: member.nickname,
    });
  }

  return hal;

}
