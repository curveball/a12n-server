import { Group, Principal } from '../../types.ts';
import { HalResource, HalFormsTemplate } from 'hal-types';
import { PrivilegeMap } from '../../privilege/types.ts';

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
      'create-form': { href: '/group/new', title: 'Create New Group'},
    },
    total: groups.length,
  };

  return hal;

}

/**
 * Generate a HAL response for a specific group
 */
export function item(group: Group, privileges: PrivilegeMap, isAdmin: boolean, groups: Group[], members: Principal[]): HalResource {

  return {
    _links: {
      self: {href: group.href, title: group.nickname },
      up : { href: '/group', title: 'List of groups' },
      group: groups.map( group => ({
        href: group.href,
        title: group.nickname,
      })),
      member: members.map( member => ({
        href: member.href,
        title: member.nickname
      })),
      describedby: {
        href: 'https://curveballjs.org/schemas/a12nserver/group.json',
        type: 'application/schema+json',
      },
      ...isAdmin && {
        privileges: {
          href: `${group.href}/edit/privileges`,
          title: 'Change privilege policy',
        },
      }
    },
    nickname: group.nickname,
    createdAt: group.createdAt,
    modifiedAt: group.modifiedAt,
    type: group.type,
    system: group.system || undefined,
    privileges,
    _templates: {
      ...isAdmin && {
        'add-member': addMemberForm(group),
      },
      ...members.length>0 && {
        'remove-member': removeMemberForm(group, members),
      }
    },
  };

}

/**
 * Generate a HAL response for the 'all users' group.
 *
 * This group is special as it contains a virtual representation of all users in the system.
 * We don't want to allow modifying the members list of listing the members generally.
 */
export function itemAllUsers(group: Group, privileges: PrivilegeMap, isAdmin: boolean): HalResource {

  return {
    _links: {
      'self': {href: group.href, title: group.nickname },
      'up' : { href: '/group', title: 'List of groups' },
      'describedby': {
        href: 'https://curveballjs.org/schemas/a12nserver/group.json',
        type: 'application/schema+json',
      },
      ...isAdmin && {
        privileges: {
          href: `${group.href}/edit/privileges`,
          title: 'Change privilege policy',
        }
      },
    },
    nickname: group.nickname,
    createdAt: group.createdAt,
    modifiedAt: group.modifiedAt,
    type: group.type,
    system: true,
    privileges
  };

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
