import { Principal } from '../types.js';

export type PrivilegeMap = {
  [resource: string]: string[];
};

export type Privilege = {
  privilege: string;
  description: string;
};

export type PrivilegeEntry = {
  privilege: string;
  resource: string;
  principal: Principal;
}

export type InternalPrivilege =
  | 'admin'
  | 'a12n:principals:list'
  | 'a12n:principals:create'
  | 'a12n:principals:update'
  | 'a12n:one-time-token:generate'
  | 'a12n:one-time-token:exchange'
  | 'a12n:user:change-password'
  | 'a12n:user:manage-identities'
  | 'a12n:access-token:generate';
