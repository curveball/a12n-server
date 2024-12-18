import { createClient } from 'redis';
import { KvStore } from './abstract-store.js';

type RedisConnection = ReturnType<typeof createClient>;

export class RedisKvStore extends KvStore {

  private redis: RedisConnection;

  constructor(redisUri: string) {

    super();
    this.redis = createClient({
      url: redisUri,  
    });
  }

  async get(key: string): Promise<any> {

    return this.redis.get(key);   

  }

  async set(key: string, value: string): Promise<void> {

    await this.redis.set(key, value);

  }

}

