export enum EventType {
  loginSuccess = 1,
  loginFailed = 2,
  totpFailed = 3,
  changePasswordSuccess = 3,
  resetPasswordRequest = 4,
  resetPasswordSuccess = 5,
  loginFailedInactive = 6,
  webAuthnFailed = 7,
  tokenRevoked = 7,

  oauth2BadRedirect = 11,
  generateAccessToken = 12,
}

export type LogEntry = {
  time: Date;
  ip: string;
  eventType: EventType;
  userAgent: string | null;
  country: string|null;
};

export const eventTypeString = new Map<EventType, string>([
  [EventType.loginSuccess,          'login-success'],
  [EventType.loginFailed,           'login-failed'],
  [EventType.totpFailed,            'totp-failed'],
  [EventType.webAuthnFailed,        'webauthn-failed'],
  [EventType.changePasswordSuccess, 'change-password-success'],
  [EventType.resetPasswordRequest,  'reset-password-request'],
  [EventType.resetPasswordSuccess,  'reset-password-success'],
  [EventType.loginFailedInactive,   'login-failed-inactive'],
  [EventType.tokenRevoked,          'token-revoked'],
  [EventType.oauth2BadRedirect,     'oauth2-badredirect'],
]);
