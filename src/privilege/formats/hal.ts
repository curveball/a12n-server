import { Privilege } from '../types';
import { HalResource } from 'hal-types';

export function collection(privileges: Privilege[]): HalResource {

  return {
    _links: {
      self: { href: '/privilege' },
      item: privileges.map(privilege => ({
        href: '/privilege/' + privilege.privilege,
        title: privilege.description
      })),
    },
    total: privileges.length,
  };

}

export function item(privilege: Privilege): HalResource {
  return {
    _links: {
      self: {href: '/privilege/' + privilege.privilege},
      collection: {href: '/privilege', title: 'Privilege Collection'}
    },
    privilege: privilege.privilege,
    description: privilege.description
  };
}
