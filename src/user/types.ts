export type PrincipalType = 'user' | 'app' | 'group';

export const PrincipalTypeList: PrincipalType[] = ['user', 'app', 'group'];

export type Principal = User | Group | App;

export type User = {
  id: number,
  identity: string,
  nickname: string,
  created: Date,
  type: 'user',
  active: boolean
}
export type Group = {
  id: number,
  identity: string,
  nickname: string,
  created: Date,
  type: 'group',
  active: boolean
}
export type App = {
  id: number,
  identity: string,
  nickname: string,
  created: Date,
  type: 'app'
  active: boolean
}

export type EditPrincipal = Omit<Principal, 'id' | 'privileges'>;

export type NewPrincipal = Omit<Principal, 'id'>;
