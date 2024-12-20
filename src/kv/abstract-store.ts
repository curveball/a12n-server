export type SetOptions = {
  /**
   * Time to live, in milliseconds
   */
  ttl?: number;
}

export abstract class KvStore {

  /**
   * Gets an item from the cache. Will return null if item was not found.
   */
  abstract get<T>(key: string): Promise<T | null>;

  /**
   * Sets an item in the cache
   */
  abstract set(key: string, value: any, options?: SetOptions): Promise<void>

  /**
   * Deletes an item from the cache.
   *
   * Will succeed whether or not the item existed.
   */
  abstract delete(key: string): Promise<void>;

}
