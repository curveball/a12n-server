export type OAuth2Client = {
  id: number,
  clientId: string,
  clientSecret: Buffer,
  userId: number,
};

export type OAuth2Token = {
  accessToken: string,
  refreshToken: string,
  accessTokenExpires: number,
  tokenType: 'bearer',
  userId: number,
  clientId: number,
};

export type OAuth2Code = {
  code: string;
};
