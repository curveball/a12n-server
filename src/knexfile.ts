import { getSettings } from './database';

const settings = getSettings();

module.exports = {

  development: settings,
  staging: settings,
  production: settings,

};

declare module 'knex/types/tables' {
  interface Principal {
    id: number;
    identity: string;
    type: number;
    externalId: string;
    nickname: string;
    created_at: number;
    modified_at: number;
    active: number;
  }

  interface Tables {
    principals_composite: Knex.CompositeTableType<
      Principal,
      Omit<Principal, 'id'>,
      Omit<Principal, 'id'>
    >;
  }
}

