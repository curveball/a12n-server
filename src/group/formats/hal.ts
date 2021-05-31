import { Group, Principal } from '../../principal/types';
import { HalResource, HalFormsTemplate } from 'hal-types';
import { PrivilegeMap } from '../../privilege/types';

export function memberCollection(group: Group, members: Principal[]): HalResource {

  const hal: HalResource = {
    _links: {
      self: {
        href: `${group.href}/member`,
        title: group.nickname + ' members'
      },
      item: members.map( member => ({
        href: member.href,
        title: member.nickname
      })),
    },
    total: members.length,
  };

  return hal;

}

export function collection(groups: Group[]): HalResource {

  const hal: HalResource = {
    _links: {
      'self': { href: '/group' },
      'item': groups.map( group => ({
        href: group.href,
        title: group.nickname,
      })),
      'create-form': { href: '/create-user', title: 'Create New Group'},
    },
    total: groups.length,
  };

  return hal;

}

/**
 * Generate a HAL response for a specific group
 */
export function item(group: Group, privileges: PrivilegeMap, isAdmin: boolean, groups: Group[], members: Principal[]): HalResource {

  const hal: HalResource = {
    _links: {
      'self': {href: group.href, title: group.nickname },
      'me': { href: group.identity, title: group.nickname },
      'up' : { href: '/group', title: 'List of groups' },
      'group': groups.map( group => ({
        href: group.href,
        title: group.nickname,
      })),
      'member': members.map( member => ({
        href: member.href,
        title: member.nickname
      })),
      'member-collection': {
        href: `${group.href}/member`,
        title: 'Group member',
        hints: {
          status: 'deprecated'
        },
      }
    },
    nickname: group.nickname,
    active: group.active,
    createdAt: group.createdAt,
    modifiedAt: group.modifiedAt,
    type: group.type,
    privileges
  };

  if (isAdmin) {
    hal._links['privileges'] = {
      href: `/user/${group.id}/edit/privileges`,
      title: 'Change privilege policy',
    };
    hal._templates = {
      'add-member': addMemberForm(group),
    };
    if (members.length>0) {
      hal._templates['remove-member'] = removeMemberForm(group, members)
    };
  }

  return hal;

}

function addMemberForm(group: Group): HalFormsTemplate {

  return {
    method: 'PATCH',
    title: 'Add member',
    target: group.href,
    properties: [
      {
        type: 'hidden',
        name: 'operation',
        value: 'add-member',
      },
      {
        type: 'text',
        prompt: 'Member',
        name: 'memberHref',
      },
    ]
  };

}
function removeMemberForm(group: Group, members: Principal[]): HalFormsTemplate {

  return {
    method: 'PATCH',
    title: 'Remove member',
    target: group.href,
    properties: [
      {
        type: 'hidden',
        name: 'operation',
        value: 'remove-member',
      },
      {
        type: 'text',
        prompt: 'Member',
        name: 'memberHref',
        options: {
          inline: members.map(member => ({
            prompt: member.nickname,
            value: member.href
          }))
        },
      },
    ]
  };

}
