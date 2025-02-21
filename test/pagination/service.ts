import { strict as assert } from 'node:assert';
import { after, before, describe, it } from 'node:test';

import { PrincipalService } from '../../src/principal/service.ts';
import { PrincipalNew } from '../../src/api-types.ts';
import { User } from '../../src/types.ts';
import db, { init } from '../../src/database.ts';

describe('users pagination', () => {

  let users: User[] = [];
  const principalService = new PrincipalService('insecure');

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
