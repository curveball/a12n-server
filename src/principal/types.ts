import { PrincipalType } from '../types';

export type NewPrincipal<TType extends PrincipalType> = {
  type: TType;
  identity: string;
  nickname: string;
  createdAt: Date;
  modifiedAt: Date;
  active: boolean;
}

export type PrincipalStats = {
  user: number;
  app: number;
  group: number;
};
