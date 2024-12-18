import { createClient } from 'redis';

type RedisConnection = ReturnType<typeof createClient>;

export abstract class KvStore {

  abstract get(key: string): Promise<any>;
  abstract set(key: string, valid: any): Promise<void>

}

