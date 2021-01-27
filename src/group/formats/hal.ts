import { User } from '../../user/types';
import { HalResource } from 'hal-types';

export function collection(user: User, members: User[]): HalResource {

  const hal: HalResource = {
    _links: {
      self: {
        href: '/user/' + user.id + '/member',
        title: user.nickname + ' members'
      },
      item: members.map( member => ({
        href: '/user/' + member.id,
        title: member.nickname
      })),
    },
    total: members.length,
  };

  return hal;

}
