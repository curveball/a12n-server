export enum UserType {
  user = 1,
  app = 2,
}

export type User = {

  id: number,
  identity: string,
  nickname: string,
  created: Date,
  type: UserType,

};
