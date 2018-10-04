export enum EventType {
  loginSuccess = 1,
  loginFailed,
  totpFailed,

  oauth2BadRedirect = 11,

}

export type LogEntry = {
  time: Date,
  userId: number,
  ip: string,
  eventType: EventType,
};
