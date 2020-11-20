export enum EventType {
  loginSuccess = 1,
  loginFailed,
  totpFailed,
  changePasswordSuccess,
  resetPasswordRequest,
  resetPasswordSuccess,
  loginFailedInactive,
  webAuthnFailed,
  tokenRevoked,
  oauth2BadRedirect = 11,
}

export type LogEntry = {
  time: Date,
  ip: string,
  eventType: EventType,
  userAgent: string,
  country: string|null,
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
