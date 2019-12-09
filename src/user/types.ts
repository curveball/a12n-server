export type UserType = 'user' | 'app' | 'group';

export const UserTypeList: UserType[] = ['user', 'app', 'group'];

export type User = {
  id: number,
  identity: string,
  nickname: string,
  created: Date,
  type: UserType,
  active: boolean
};

export type NewUser = Omit<User, 'id'>;
