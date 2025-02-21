import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import * as hal from '../../src/user/formats/hal.ts';
import { User } from '../../src/types.ts';
import { HalResource } from 'hal-types';

// TODO: delete this & test the findAll db query directly instead
describe.skip('hal.collection', () => {
  const users: User[] = [
    {
      id: 1,href: '/user/1',
      externalId: 'user-1',
      type: 'user',
      nickname: 'User One',
      createdAt: new Date(Date.now()),
      modifiedAt: new Date(Date.now()),
      active: true,
      system: false,
    },
    {
      id: 2,
      href: '/user/2',
      externalId: 'user-2',
      type: 'user',
      nickname: 'User Two',
      createdAt: new Date(Date.now()),
      modifiedAt: new Date(Date.now()),
      active: true,
      system: false,
    },
    {
      id: 3,
      href: '/user/3',
      externalId: 'user-3',
      type: 'user',
      nickname: 'User Three',
      createdAt: new Date(Date.now()),
      modifiedAt: new Date(Date.now()),
      active: true,
      system: false,
    },
    {
      id: 4,
      href: '/user/4',
      externalId: 'user-4',
      type: 'user',
      nickname: 'User Four',
      createdAt: new Date(Date.now()),
      modifiedAt: new Date(Date.now()),
      active: true,
      system: false,
    },
    {
      id: 5,
      href: '/user/5',
      externalId: 'user-5',
      type: 'user',
      nickname: 'User Five',
      createdAt: new Date(Date.now()),
      modifiedAt: new Date(Date.now()),
      active: true,
      system: false,
    },
    {
      id: 6,
      href: '/user/6',
      externalId: 'user-6',
      type: 'user',
      nickname: 'User Six',
      createdAt: new Date(Date.now()),
      modifiedAt: new Date(Date.now()),
      active: true,
      system: false,
    },
    {
      id: 7,
      href: '/user/7',
      externalId: 'user-7',
      type: 'user',
      nickname: 'User Seven',
      createdAt: new Date(Date.now()),
      modifiedAt: new Date(Date.now()),
      active: true,
      system: false,
    },
    {
      id: 8,
      href: '/user/8',
      externalId: 'user-8',
      type: 'user',
      nickname: 'User Eight',
      createdAt: new Date(Date.now()),
      modifiedAt: new Date(Date.now()),
      active: true,
      system: false,
    },
    {
      id: 9,
      href: '/user/9',
      externalId: 'user-9',
      type: 'user',
      nickname: 'User Nine',
      createdAt: new Date(Date.now()),
      modifiedAt: new Date(Date.now()),
      active: true,
      system: false,
    },
    {
      id: 10,
      href: '/user/10',
      externalId: 'user-10',
      type: 'user',
      nickname: 'User Ten',
      createdAt: new Date(Date.now()),
      modifiedAt: new Date(Date.now()),
      active: true,
      system: false,
    },
  ];

  it('should display all users', () => {
    const embeddedUsers: HalResource[] = [];
    const currentPage = 1;
    const pageSize = 100;

    const halRes = hal.collection(embeddedUsers, { principals: users, total: users.length, page: currentPage, pageSize, hasNextPage: false });

    const expected = {
      _links: {
        'create-form': {
          href: '/user/new',
          title: 'Create New User',
          type: 'text/html'
        },
        'find-by-href': {
          href: '/user/byhref/{href}',
          templated: true,
          title: 'Find a user through a identity/href (exact match)'
        },
        item: [
          {
            href: '/user/1',
            title: 'User One'
          },
          {
            href: '/user/2',
            title: 'User Two'
          },
          {
            href: '/user/3',
            title: 'User Three'
          },
          {
            href: '/user/4',
            title: 'User Four'
          },
          {
            href: '/user/5',
            title: 'User Five'
          },
          {
            href: '/user/6',
            title: 'User Six'
          },
          {
            href: '/user/7',
            title: 'User Seven'
          },
          {
            href: '/user/8',
            title: 'User Eight'
          },
          {
            href: '/user/9',
            title: 'User Nine'
          },
          {
            href: '/user/10',
            title: 'User Ten'
          }
        ],
        self: {
          href: '/user?page=1'
        }
      },
      currentPage: 1,
      total: 10,
      totalPages: 1
    };

    assert.deepEqual(halRes, expected);

  });

  it('should display the first 3 users', () => {
    const embeddedUsers: HalResource[] = [];
    const currentPage = 1;
    const pageSize = 3;

    const halRes = hal.collection(embeddedUsers, { principals: users, total: users.length, page: currentPage, pageSize, hasNextPage: false });

    const expected = {
      _links: {
        'create-form': {
          href: '/user/new',
          title: 'Create New User',
          type: 'text/html'
        },
        'find-by-href': {
          href: '/user/byhref/{href}',
          templated: true,
          title: 'Find a user through a identity/href (exact match)'
        },
        item: [
          {
            href: '/user/1',
            title: 'User One'
          },
          {
            href: '/user/2',
            title: 'User Two'
          },
          {
            href: '/user/3',
            title: 'User Three'
          },
        ],
        next: {
          href: '/user?page=2'
        },
        self: {
          href: '/user?page=1'
        }
      },
      currentPage: 1,
      total: 10,
      totalPages: 4
    };

    assert.deepEqual(halRes, expected);

  });

  it('should display the second 3 users', () => {
    const embeddedUsers: HalResource[] = [];
    const currentPage = 2;
    const pageSize = 3;

    const halRes = hal.collection(embeddedUsers, { principals: users, total: users.length, page: currentPage, pageSize, hasNextPage: false });

    const expected = {
      _links: {
        'create-form': {
          href: '/user/new',
          title: 'Create New User',
          type: 'text/html'
        },
        'find-by-href': {
          href: '/user/byhref/{href}',
          templated: true,
          title: 'Find a user through a identity/href (exact match)'
        },
        item: [
          {
            href: '/user/4',
            title: 'User Four'
          },
          {
            href: '/user/5',
            title: 'User Five'
          },
          {
            href: '/user/6',
            title: 'User Six'
          },
        ],
        next: {
          href: '/user?page=3'
        },
        previous: {
          href: '/user?page=1'
        },
        self: {
          href: '/user?page=2'
        }
      },
      currentPage: 2,
      total: 10,
      totalPages: 4
    };

    assert.deepEqual(halRes, expected);

  });
  it('should display the last 2 users', () => {
    const embeddedUsers: HalResource[] = [];
    const currentPage = 5;
    const pageSize = 2;

    const halRes = hal.collection(embeddedUsers, { principals: users, total: users.length, page: currentPage, pageSize, hasNextPage: false });

    const expected = {
      _links: {
        'create-form': {
          href: '/user/new',
          title: 'Create New User',
          type: 'text/html'
        },
        'find-by-href': {
          href: '/user/byhref/{href}',
          templated: true,
          title: 'Find a user through a identity/href (exact match)'
        },
        item: [
          {
            href: '/user/9',
            title: 'User Nine'
          },
          {
            href: '/user/10',
            title: 'User Ten'
          }
        ],
        previous: {
          href: '/user?page=4'
        },
        self: {
          href: '/user?page=5'
        }
      },
      currentPage: 5,
      total: 10,
      totalPages: 5
    };

    assert.deepEqual(halRes, expected);

  });
});
