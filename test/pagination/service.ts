import { strict as assert } from 'node:assert';
import { after, before, describe, it } from 'node:test';

import { PrincipalService } from '../../src/principal/service.ts';
import { PrincipalNew } from '../../src/api-types.ts';
import * as hal from '../../src/user/formats/hal.ts';
import db, { init } from '../../src/database.ts';
import { User } from '../../src/types.ts';
import { HalResource } from 'hal-types';

describe('users pagination', () => {
  const principalService = new PrincipalService('insecure');
  let users: User[] = [];

  before(async () => {
    await init();

    const hasTable = await db.schema.hasTable('principals');
    if (!hasTable) {
      await db.schema.createTable('principals', (table) => {
        table.increments('id').primary();
        table.string('identity').nullable();
        table.string('external_id').notNullable();
        table.string('nickname').notNullable();
        table.integer('type').notNullable();
        table.bigInteger('created_at').defaultTo(db.fn.now());
        table.bigInteger('modified_at').defaultTo(db.fn.now());
        table.boolean('active').notNullable().defaultTo(false);
        table.tinyint('system').notNullable().defaultTo(0);
      });
    }

    // 3 pages worth of users
    for(let i = 1; i < 251; i++){
      const data = {
        type: 'user' as PrincipalNew['type'],
        nickname: `User ${i}`,
        createdAt: new Date(Date.now()),
        modifiedAt: new Date(Date.now()),
        active: true,
      };
      await principalService.save(data);
    }

    users = await principalService.findAll('user');
  });

  after(async () => {
    await db.destroy();
  });

  describe('search service', () => {
    it('should display first page', async () => {
      const currentPage = 1;
      const { items, pageSize, page, hasNextPage, total } = await principalService.search('user', currentPage);
      const expectedUsers = users.slice(0, pageSize);

      assert.equal(page, currentPage);
      assert.equal(hasNextPage, true);
      assert.equal(total, users.length);
      assert.deepEqual(items, expectedUsers);
    });

    it('should display second page', async () => {
      const currentPage = 2;
      const { items, pageSize, page, hasNextPage, total } = await principalService.search('user', currentPage);
      const expectedUsers = users.slice(pageSize, 200);

      assert.equal(page, currentPage);
      assert.equal(hasNextPage, true);
      assert.equal(total, users.length);
      assert.deepEqual(items, expectedUsers);
    });

    it('should display last (third) page', async () => {
      const currentPage = 3;
      const { items, page, hasNextPage, total } = await principalService.search('user', currentPage);
      const expectedUsers = users.slice(200, users.length);

      assert.equal(page, currentPage);
      assert.equal(hasNextPage, false);
      assert.equal(total, users.length);
      assert.deepEqual(items, expectedUsers);
    });
  });

  describe('hal.collection links', () => {
    const embeddedUsers: HalResource[] = [];

    it('should not display `previous` link on first page', async () => {
      const currentPage = 1;

      const paginatedResult = await principalService.search<User>('user', currentPage);
      const halRes = hal.collection(paginatedResult, embeddedUsers);

      assert.equal(halRes._links.previous, undefined);
      assert.deepEqual(halRes._links.self, {
        href: '/user',
      });
      assert.deepEqual(halRes._links.first, {
        href: '/user',
      });
      assert.deepEqual(halRes._links.last, {
        href: '/user?page=3',
      });
      assert.deepEqual(halRes._links.next, {
        href: '/user?page=2',
      });
    });

    it('should not display `next` link on last page', async () => {
      const currentPage = 3;

      const paginatedResult = await principalService.search<User>('user', currentPage);
      const halRes = hal.collection(paginatedResult, embeddedUsers);

      assert.equal(halRes._links.next, undefined);
      assert.deepEqual(halRes._links.self, {
        href: '/user?page=3',
      });
      assert.deepEqual(halRes._links.first, {
        href: '/user',
      });
      assert.deepEqual(halRes._links.last, {
        href: '/user?page=3',
      });
      assert.deepEqual(halRes._links.previous, {
        href: '/user?page=2',
      });
    });

    it('should display both `previous` & `next` links on middle page', async () => {
      const currentPage = 2;

      const paginatedResult = await principalService.search<User>('user', currentPage);
      const halRes = hal.collection(paginatedResult, embeddedUsers);

      assert.deepEqual(halRes._links.self, {
        href: '/user?page=2',
      });
      assert.deepEqual(halRes._links.first, {
        href: '/user',
      });
      assert.deepEqual(halRes._links.last, {
        href: '/user?page=3',
      });
      assert.deepEqual(halRes._links.previous, {
        href: '/user',
      });
      assert.deepEqual(halRes._links.next, {
        href: '/user?page=3',
      });
    });
  });
});
