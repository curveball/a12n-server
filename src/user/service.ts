import { User } from './types';
import database from '../database';
import { NotFound } from '../errors';

export async function findAll(): Promise<User[]> {

  const query = `SELECT id, identity, nickname, created FROM users WHERE active = 1`;
  const result = await database.query(query);

  const users: User[] = [];
  for(const user of result[0]) {
    users.push(recordToModel(user));
  }
  return users;

}

export async function findById(id: number): Promise<User> {

  const query = `SELECT id, identity, nickname, created FROM users WHERE active = 1 AND id = ?`;
  const result = await database.query(query, [id]);

  if (result[0].length !== 1) {
    throw new NotFound('User with id: ' + id + ' not found');
  }

  return recordToModel(result[0][0]);

}

type UserRecord = {
  id: number,
  identity: string,
  nickname: string,
  created: number,
}

function recordToModel(user: UserRecord): User {

  return { 
    id: user.id,
    identity: user.identity,
    nickname: user.nickname,
    created: new Date(user.created * 1000)
  };

}
