

export type PrincipalType = 'user' | 'app' | 'group';
export const PrincipalTypeList: PrincipalType[] = ['user', 'app', 'group'];

export type BasePrincipal<TType extends PrincipalType> = {
  id: number;
  href: string;
  externalId: string;
  type: TType;
  identity: string;
  nickname: string;
  createdAt: Date;
  modifiedAt: Date;
  active: boolean;
}

export type User = BasePrincipal<'user'>;
export type Group = BasePrincipal<'group'>;
export type App = BasePrincipal<'app'>;

export type Principal = User | Group | App;

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
