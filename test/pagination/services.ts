import { strict as assert } from 'node:assert';
import { after, before, describe, it } from 'node:test';

import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.test'});

import { PrincipalService, recordToModel } from '../../src/principal/service.ts';
import db, { insertAndGetId } from '../../src/database.ts';

describe('findAll users pagination', () => {

  const userRecordsDb: unknown[] = [];
  before(async () => {

    await db.schema.createTable('principals', (table) => {
      table.increments('id').primary();
      table.string('external_id').notNullable();
      table.string('nickname').notNullable();
      table.integer('type').notNullable();
      table.boolean('active').notNullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('modified_at').defaultTo(db.fn.now());
      table.boolean('system').notNullable();
    });

    // 3 pages worth of users
    for(let i = 1; i < 251; i++){
      const data = {
        external_id: i.toString(),
        nickname: `User ${i}`,
        type: 1,
        active: 1,
        created_at: Date.now(),
        modified_at: Date.now(),
        system: 0
      };

      const id = await insertAndGetId('principals', data);
      userRecordsDb.push({...data, id});
    }
  });

  after(async () => {
    await db.destroy();
  });

  it('should display first page', async () => {
    const principalService = new PrincipalService('insecure');

    const currentPage = 1;
    const { principals, pageSize, page, hasNextPage, total } = await principalService.findAll('user', currentPage);
    const expectedUsers = userRecordsDb.slice(0, pageSize).map((data) => recordToModel(data));

    assert.equal(page, currentPage);
    assert.equal(hasNextPage, true);
    assert.equal(total, userRecordsDb.length);
    assert.deepEqual(principals, expectedUsers);
  });

  it('should display second page', async () => {
    const principalService = new PrincipalService('insecure');

    const currentPage = 2;
    const { principals, pageSize, page, hasNextPage, total } = await principalService.findAll('user', currentPage);
    const expectedUsers = userRecordsDb.slice(pageSize, 200).map((data) => recordToModel(data));

    assert.equal(page, currentPage);
    assert.equal(hasNextPage, true);
    assert.equal(total, userRecordsDb.length);
    assert.deepEqual(principals, expectedUsers);
  });

  it('should display last (third) page', async () => {
    const principalService = new PrincipalService('insecure');

    const currentPage = 3;
    const { principals, page, hasNextPage, total } = await principalService.findAll('user', currentPage);
    const expectedUsers = userRecordsDb.slice(200, userRecordsDb.length).map((data) => recordToModel(data));

    assert.equal(page, currentPage);
    assert.equal(hasNextPage, false);
    assert.equal(total, userRecordsDb.length);
    assert.deepEqual(principals, expectedUsers);
  });
});
