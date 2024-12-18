import { KvStore } from './abstract-store.js';
import { MemoryKvStore } from './memory-store.js';
import { RedisKvStore } from './redis-store.js';

let kvStore: KvStore;

export function getStore(): KvStore {

  if (!kvStore) {
    if (process.env.REDIS_URI) {
      kvStore = new RedisKvStore(process.env.REDIS_URI);
    } else {
      kvStore = new MemoryKvStore();
    }
  }
  return kvStore;

}

