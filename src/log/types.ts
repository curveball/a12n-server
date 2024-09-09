export enum EventType {
  loginSuccess = 1,
  loginFailed = 2,
  totpFailed = 3,
  changePasswordSuccess = 4,
  resetPasswordRequest = 5,
  resetPasswordSuccess = 6,
  loginFailedInactive = 7,
  webAuthnFailed = 8,
  tokenRevoked = 9,
  loginFailedNotVerified = 10,

  oauth2BadRedirect = 11,
  generateAccessToken = 12,

  accountLocked = 13,
  loginFailedAccountLocked = 14,
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
  [EventType.loginFailedNotVerified,'login-failed-notverified'],
  [EventType.tokenRevoked,          'token-revoked'],
  [EventType.oauth2BadRedirect,     'oauth2-badredirect'],
  [EventType.accountLocked, 'account-locked'],
  [EventType.loginFailedAccountLocked, 'login-failed-account-locked'],
]);
