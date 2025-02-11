import { createClient } from 'redis';
import { KvStore, SetOptions } from './abstract-store.ts';
import dbg from 'debug';

const debug = dbg('redis-store');

type RedisConnection = ReturnType<typeof createClient>;

export class RedisKvStore extends KvStore {

  private redis: RedisConnection;

  constructor(redisUri: string) {

    super();
    this.redis = createClient({
      url: redisUri,
    });
    this.redis.connect();
  }

  /**
   * Gets an item from the cache. Will return null if item was not found.
   */
  async get<T>(key: string): Promise<T | null> {

    debug('Returning %s', key);
    const val = await this.redis.get(key);
    if (val===null) return null;
    return JSON.parse(val);

  }

  /**
   * Sets an item in the cache
   */
  async set(key: string, value: any, options?: SetOptions): Promise<void> {

    debug('Storing %s', key);
    if (options?.ttl) {
      const newTtl = Math.floor(options.ttl / 1000);
      await this.redis.setEx(
        key,
        newTtl,
        JSON.stringify(value)
      );
    } else {
      await this.redis.set(key, JSON.stringify(value));
    }

  }

  /**
   * Deletes an item from the cache.
   *
   * Will succeed whether or not the item existed.
   */
  async delete(key: string): Promise<void> {

    debug('Deleting: %s', key);
    await this.redis.del(key);

  }

  destroy() {

    this.redis.disconnect();

  }

}

