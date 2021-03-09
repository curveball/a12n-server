import { Group, Principal } from '../../user/types';
import { HalResource } from 'hal-types';

export function collection(group: Group, members: Principal[]): HalResource {

  const hal: HalResource = {
    _links: {
      self: {
        href: '/user/' + group.id + '/member',
        title: group.nickname + ' members'
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
