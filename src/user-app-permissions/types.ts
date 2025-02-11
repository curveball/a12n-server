import { User, App } from '../types.ts';

/**
 * This type represents the set of permissions that an app is allowed to use
 * by a user.
 *
 * This can contain things like 'email', enabling an app to access a users'
 * email, but it may also concrete privileges.
 */
export type UserAppPermission = {

  /**
   * Reference to the app.
   */
  app: App;

  /**
   * User / Resource owner
   */
  user: User;

  /**
   * Scopes/privileges that the app has access to.
   */
  scope: string[];

  /**
   * When the user first gave permission to the app
   */
  createdAt: Date;

  /**
   * Last time the set of permissions were changed
   */
  modifiedAt: Date;

  /**
   * Last time this application issued or refreshed an access token
   */
  lastUsedAt: Date | null;
}
