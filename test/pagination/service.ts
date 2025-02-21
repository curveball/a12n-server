import { strict as assert } from 'node:assert';
import { after, before, describe, it } from 'node:test';

import { PrincipalsRecord } from 'knex/types/tables.ts';

import { PrincipalService, recordToModel } from '../../src/principal/service.ts';
import db, { insertAndGetId } from '../../src/database.ts';

describe('users pagination', () => {

  const userRecordsDb: PrincipalsRecord[] = [];

  before(async () => {

    await db.schema.createTable('principals', (table) => {
      table.increments('id').primary();
      table.string('identity').nullable();
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
      const data: Omit<PrincipalsRecord, 'id'> = {
        identity: null,
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
    const { items, pageSize, page, hasNextPage, total } = await principalService.search('user', currentPage);
    const expectedUsers = userRecordsDb.slice(0, pageSize).map((data) => recordToModel(data));

    assert.equal(page, currentPage);
    assert.equal(hasNextPage, true);
    assert.equal(total, userRecordsDb.length);
    assert.deepEqual(items, expectedUsers);
  });

  it('should display second page', async () => {
    const principalService = new PrincipalService('insecure');

    const currentPage = 2;
    const { items, pageSize, page, hasNextPage, total } = await principalService.search('user', currentPage);
    const expectedUsers = userRecordsDb.slice(pageSize, 200).map((data) => recordToModel(data));

    assert.equal(page, currentPage);
    assert.equal(hasNextPage, true);
    assert.equal(total, userRecordsDb.length);
    assert.deepEqual(items, expectedUsers);
  });

  it('should display last (third) page', async () => {
    const principalService = new PrincipalService('insecure');

    const currentPage = 3;
    const { items, page, hasNextPage, total } = await principalService.search('user', currentPage);
    const expectedUsers = userRecordsDb.slice(200, userRecordsDb.length).map((data) => recordToModel(data));

    assert.equal(page, currentPage);
    assert.equal(hasNextPage, false);
    assert.equal(total, userRecordsDb.length);
    assert.deepEqual(items, expectedUsers);
  });
});
