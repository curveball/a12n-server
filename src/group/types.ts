import { User } from '../user/types';

export type Group = {
  id: number,
  user: User[],
  name: string,
  created: Date,
}