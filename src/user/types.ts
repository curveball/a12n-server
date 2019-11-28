export enum UserType {
  user = 1,
  app = 2,
  group = 3,
}

export type User = {
  id: number,
  identity: string,
  nickname: string,
  created: Date,
  type: UserType,
  active: boolean
};

export type NewUser = Omit<User, 'id'>;
