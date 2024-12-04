/**
 * List of possible events along with their database code.
 *
 * There's no significance to the number, other than the order at which the log
 * messages were introduced.
 */
export const eventTypeMap = {

  // Successful login via the login screen
  'login-success': 1,

  // User entered a correct password
  'password-check-success' : 18,

  // User entered an incorrect password
  'password-check-failed' : 2,

  // Account was deactivated by an admin
  'login-failed-inactive': 8,

  // A credential used by a user to log in (like an email address) was not
  // verified. The credential must be verifiedd before it can be used.
  'login-failed-notverified': 10,

  // A user tried to log in using an account that was previously locked
  'login-failed-account-locked': 14,

  // TOTP challenge failed
  'totp-failed': 3,
  // TOTP challenge successful
  'totp-success': 15,

  'webauthn-failed': 8,

  'change-password-success': 5,

  'reset-password-request': 6,
  'reset-password-success': 7,

  'token-revoked': 8,
  'oauth2-badredirect': 11,
  'generate-access-token': 12,

  // Triggered when an account is locked down due to a security trigger, such
  // as getting a password wrong 5 times.
  'account-locked': 13,

  // Triggered when the user started a new authorization challenge
  // login session.
  'login-challenge-started': 16,

  // Triggered after a successful login challenge process.
  'login-challenge-success': 17,
} as const;

export type EventType = keyof typeof eventTypeMap;

export const reverseEventTypeMap = new Map<number, EventType>(
  (Object.entries(eventTypeMap).map( ([k,v]): [number, EventType] => [v,k as EventType]))
);

export type LogEntry = {
  time: Date;
  ip: string;
  eventType: EventType;
  userAgent: string | null;
  country: string|null;
};

/**
 * A function that logs user security event.
 *
 * This function is initialized to be associated to a specific user,
 * making it easy to pass around.
 */
export type UserEventLogger = (eventType: EventType) => Promise<void>
