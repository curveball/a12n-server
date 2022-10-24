import { Principal } from '../types';

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
