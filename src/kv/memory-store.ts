import { KvStore } from './abstract-store.js';

export class MemoryKvStore extends KvStore {

  store: Map<string, any>;

  constructor() {

    super();
    this.store = new Map();

  }

  async get(key: string): Promise<any> {

    return this.store.get(key);

  }

  async set(key: string, value: string): Promise<void> {

    this.store.set(key, value);

  }

}
