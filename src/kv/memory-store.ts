import { KvStore, SetOptions } from './abstract-store.ts';
import dbg from 'debug';

const debug = dbg('kv');

type ValueMeta = {
  value: any,
  expires: number|null,
};

export class MemoryKvStore extends KvStore {

  store: Map<string, ValueMeta>;

  constructor() {

    super();
    this.store = new Map();

  }

  /**
   * Gets an item from the cache. Will return null if item was not found.
   */
  async get<T>(key: string): Promise<T | null> {

    const item = this.store.get(key);
    if (!item) return null;

    if (item.expires && item.expires < Date.now()) {
      return null;
    }
    return item.value;

  }

  /**
   * Sets an item in the cache
   */
  async set(key: string, value: string, options?: SetOptions): Promise<void> {

    this.store.set(key, {
      value,
      expires: options?.ttl ? Date.now() + options.ttl : null,
    });

    if (options?.ttl) {
      this.scheduleGc();
    }

  }

  /**
   * Deletes an item from the cache.
   *
   * Will succeed whether or not the item existed.
   */
  async delete(key: string): Promise<void> {

    this.store.delete(key);

  }


  /**
   * Runs the garbage collector.
   *
   * Returns the next expiry timestamp, if any.
   */
  gc(): number | null {

    const now = Date.now();
    let expireCount = 0;
    let nextExpiry = Infinity;
    for(const [k, v] of this.store.entries()) {

      if (v.expires) {
        if(v.expires < now) {
          this.store.delete(k);
          expireCount++;
        } else {
          nextExpiry = Math.min(v.expires, nextExpiry);
        }

      }

    }

    debug('Garbage collected %i items from in-memory kv store', expireCount);

    return nextExpiry === Infinity ? null : nextExpiry;
  }

  private gcTimer: ReturnType<typeof setTimeout> | null = null;

  scheduleGc(timeout = 60000) {

    if (this.gcTimer) {
      return;
      // already running
    }
    this.gcTimer = setTimeout(() => {
      this.gcTimer = null;
      const next = this.gc();
      if (next === null) {
        // There's nothing left in the cache. Not scheduling
        // the next GC
        return;
      }
      // Scheduling the next run
      this.scheduleGc();
    }, timeout);

  }

  destroy() {

    if (this.gcTimer) clearTimeout(this.gcTimer);

  }

}
