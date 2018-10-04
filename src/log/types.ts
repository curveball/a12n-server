export enum EventType {
  loginSuccess = 1,
  loginFailed,
  totpFailed,
}

export type LogEntry = {
  time: Date,
  userId: number,
  ip: string,
  eventType: EventType,
};
