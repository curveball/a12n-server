import { Privilege } from '../types';

export function collection(privileges: Privilege[]) {

  const hal: any = {
    _links: {
      'self': { href: '/privilege' },
      'item': [],
    },
  };

  for (const privilege of privileges) {
    hal._links.item.push({
      href: '/privilege/' + privilege.privilege,
      title: privilege.description
    })
  }
  return hal;
}

export function item(privilege: Privilege) {
  const hal: any = {
    _links: {
      'self': {href: '/privilege/' + privilege.privilege},
      'collection': {href: '/privilege', title: 'Privilege Collection'}
    },
    privilege: privilege.privilege,
    description: privilege.description
  };


  return hal;
}