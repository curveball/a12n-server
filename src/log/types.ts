export enum EventType {
  loginSuccess = 1,
  loginFailed,
  totpFailed,
  changePasswordSuccess,
  resetPasswordRequest,
  resetPasswordSuccess,
  oauth2BadRedirect = 11,
}

export type LogEntry = {
  time: Date,
  userId: number,
  ip: string,
  eventType: EventType,
};

export const eventTypeString = new Map<EventType, string>([
  [EventType.loginSuccess,      'login-success'],
  [EventType.loginFailed,       'login-failed'],
  [EventType.totpFailed,        'totp-failed'],
  [EventType.changePasswordSuccess, 'change-password-success'],
  [EventType.resetPasswordRequest, 'reset-password-request'],
  [EventType.resetPasswordSuccess, 'reset-password-success'],
  [EventType.oauth2BadRedirect, 'oauth2-badredirect'],
]);
