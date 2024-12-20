import { describe, test, after } from 'node:test';
import { strict as assert } from 'node:assert';
import { KvStore } from '../../src/kv/abstract-store.js';
import { MemoryKvStore } from '../../src/kv/memory-store.js';
import { RedisKvStore } from '../../src/kv/redis-store.js';

function testStore(store: KvStore, name: string) {

  describe('Testing ' + name, () => {

    test('set and get', async() => {

      await store.set('foo', 'bar');
      assert.equal(await store.get('foo'), 'bar');

    });

    test('set, delete and get', async() => {

      await store.set('foo', 'bar');
      await store.delete('foo');
      assert.equal(await store.get('foo'), null);

    });

    test('set with ttl', async() => {

      await store.set('foo', 'bar', { ttl: 1000 });
      assert.equal(await store.get('foo'), 'bar');

    });

    test('set with ttl. get after expiry', async() => {

      await store.set('foo', 'bar', { ttl: 1000 });
      await new Promise(res => setTimeout(res, 1500));
      assert.equal(await store.get('foo'), null);

    });

    after(() => {
      store.destroy();
    });

  });

}


describe('KV Stores', () => {

  testStore(new MemoryKvStore(), 'MemoryKvStore');
  if (process.env.REDIS_URI) {
    testStore(new RedisKvStore(process.env.REDIS_URI), 'RedisKvStore');
  } else {
    test.skip('RedisKvStore');
  }

});

