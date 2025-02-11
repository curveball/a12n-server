import { SessionStore } from '@curveball/session';
import { KvStore, SetOptions } from './abstract-store.ts';
import { MemoryKvStore } from './memory-store.ts';
import { RedisKvStore } from './redis-store.ts';
import { generateSecretToken } from '../crypto.ts';

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
 * KV prefix for session data.
 *
 * This contains a version number, which will change whenever the structure of the session data
 * changes, but when it does it will cause all existing sessions to be invalidated.
 */
const sessionKeyPrefix = 'a12n:session:2:';

/**
 * Returns a SessionStore, which is the interface @curveball/session
 * wants. It maps to the active KvStore
 */
export function getSessionStore(): SessionStore {

  const store = getStore();
  return {
    get: (id: string): Promise<Record<string, any>|null> => {
      return store.get<Record<string, any>>(sessionKeyPrefix + id);
    },

    set: (id: string, values: Record<string, any>, expire: number): Promise<void> => {
      return store.set(sessionKeyPrefix + id, values, { ttl: expire * 1000 });

    },

    delete: (id: string): Promise<void> => {
      return store.delete(sessionKeyPrefix + id);
    },

    newSessionId() {

      return generateSecretToken();

    }

  };

}
