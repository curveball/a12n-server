import { MemoryStore, SessionStore } from '@curveball/session';
import { RedisStore } from '@curveball/session-redis';

let store: SessionStore;

export function getSessionStore(): SessionStore {

  if (store) return store;

  if (process.env.REDIS_URI) {
    store = new RedisStore({
      prefix: 'A12N-session',
      clientOptions: {
        url: process.env.REDIS_URI!,
      },
    });
  } else {
    store = new MemoryStore();
  }
  return store;

}



