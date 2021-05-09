export type Principal = User | Group | App;
export type NewPrincipal = Omit<Principal, 'id' | 'href'>;

export type PrincipalType = 'user' | 'app' | 'group';
export const PrincipalTypeList: PrincipalType[] = ['user', 'app', 'group'];

export type User = {
  id: number;
  href: string;
  type: 'user';
  identity: string;
  nickname: string;
  createdAt: Date;
  modifiedAt: Date;
  active: boolean;
}

export type Group = {
  id: number;
  href: string;
  type: 'group';
  identity: string;
  nickname: string;
  createdAt: Date;
  modifiedAt: Date;
  active: boolean;
}

export type App = {
  id: number;
  href: string;
  type: 'app';
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
