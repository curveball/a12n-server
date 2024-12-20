import { SessionStore } from '@curveball/session';
import { KvStore, SetOptions } from './abstract-store.js';
import { MemoryKvStore } from './memory-store.js';
import { RedisKvStore } from './redis-store.js';
import { generateSecretToken } from '../crypto.js';

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

export function get<T>(key: string): Promise<T | null> {

  return getStore().get<T>(key);

}

export function set(key: string, value: any, options?: SetOptions): Promise<void> {
  return getStore().set(key, value, options);
}

export function del(key: string): Promise<void> {
  return getStore().delete(key);
}


/**
 * Returns a SessionStore, which is the interface @curveball/session
 * wants. It maps to the active KvStore
 */
export function getSessionStore(): SessionStore {

  const store = getStore();
  return {
    get: (id: string): Promise<Record<string, any>|null> => {
      return store.get<Record<string, any>>('a12n:session:' + id);
    },

    set: (id: string, values: Record<string, any>, expire: number): Promise<void> => {
      return store.set('a12n:session:' + id, values, { ttl: expire * 1000 });

    },

    delete: (id: string): Promise<void> => {
      return store.delete(id);
    },

    newSessionId() {

      return generateSecretToken();

    }

  };

}
