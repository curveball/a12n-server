export type OneTimeToken = {
  token: string;
  /**
   * When the token expires
   */
  expires: Date;

  /**
   * Total time the token was valid for
   */
  ttl: number;
}
