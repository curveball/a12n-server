import { User } from '../user/types';

export type OAuth2Client = {
  id: number,
  clientId: string,
  clientSecret: Buffer,
  user: User,
  allowedGrantTypes: string[],
};

export type OAuth2Token = {
  accessToken: string,
  refreshToken: string,
  accessTokenExpires: number,
  tokenType: 'bearer',
  user: User,
  clientId: number,
};

export type OAuth2Code = {
  code: string;
};

export type CodeChallengeMethod = 'plain' | 'S256';