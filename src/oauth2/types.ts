export type OAuth2Client = {
  id: number,
  clientId: string
}

export type OAuth2Token = {
  accessToken: string,
  refreshToken: string,

  accessTokenExpires: number,
};
