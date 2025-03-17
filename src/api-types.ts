/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This is the request body used by the HTML form submission for editing new OAuth2 Clients (credentials)
 */
export interface AppClientEditFormBody {
  /**
   * client_id for this client. May be omitted for edits and must not change from the original
   */
  clientId?: string;
  /**
   * Can the client can use the 'client_credentials' flow
   */
  allowClientCredentials?: string;
  /**
   * Can the client can use the 'authorization_code' flow
   */
  allowAuthorizationCode?: string;
  /**
   * Can the client can use the OAuth 2.0 for First Party Applications flow
   */
  allowAuthorizationChallenge?: string;
  /**
   * Can the client can use the deprecated 'implicit' flow
   */
  allowImplicit?: string;
  /**
   * Is the client allowed to refresh tokens
   */
  allowRefreshToken?: string;
  /**
   * Can the client can use the 'password' flow flow
   */
  allowPassword?: string;
  /**
   * List of redirect uris for the authorization_code and implicit flows.
   */
  redirectUris?: string;
  /**
   * Require 'Proof of Key Code Exchange' for authorization_code flow. If not set, PKCE is supported but not enforced.
   */
  requirePkce?: string;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This is the request body used by the HTML form submission for creating new OAuth2 Clients (credentials)
 */
export interface AppClientNewFormBody {
  /**
   * Can the client can use the 'client_credentials' flow
   */
  allowClientCredentials?: string;
  /**
   * Can the client can use the 'authorization_code' flow
   */
  allowAuthorizationCode?: string;
  /**
   * Can the client can use the OAuth 2.0 for First Party Applications flow
   */
  allowAuthorizationChallenge?: string;
  /**
   * Can the client can use the deprecated 'implicit' flow
   */
  allowImplicit?: string;
  /**
   * Is the client allowed to refresh tokens
   */
  allowRefreshToken?: string;
  /**
   * Can the client can use the 'password' flow flow
   */
  allowPassword?: string;
  /**
   * List of redirect uris for the authorization_code and implicit flows.
   */
  redirectUris?: string;
  /**
   * Preferred OAuth2 client_id. If empty we'll generate one for you
   */
  clientId?: string;
  /**
   * Require 'Proof of Key Code Exchange' for authorization_code flow. If not set, PKCE is supported but not enforced.
   */
  requirePkce?: string;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This is the request body used by the HTML form submission for creating new apps
 */
export interface AppNewFormBody {
  nickname: string;
  url: string;
  clientId?: string;
  allowedGrantTypes?: string;
  redirectUris?: string;
  requirePkce?: string;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This schema represents an App. An App is a headless user that can may have privileges and credentials applied.
 */
export interface App {
  /**
   * HAL Links
   */
  _links?: {
    [k: string]: unknown;
  };
  /**
   * Human-readable displayname.
   */
  nickname: string;
  /**
   * Setting this to false will disable the app.
   */
  active: boolean;
  /**
   * Creation date and time.
   */
  createdAt: string;
  /**
   * Last time the app was modified.
   */
  modifiedAt: string;
  /**
   * Ether 'user', 'app' or 'group'
   */
  type: "app";
  privileges: {
    [k: string]: string[];
  };
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Request body for the Authorization Challenge Request endpoint for first-party applications.
 */
export interface AuthorizationChallengeRequest {
  /**
   * OAuth2 scope
   */
  scope?: string;
  /**
   * If the client has started a login session, specify auth_session to continue the login process
   */
  auth_session?: string;
  username?: string;
  /**
   * User-supplied password
   */
  password?: string;
  /**
   * A 6 digit TOTP code / authenticator app code
   */
  totp_code?: string;
  /**
   * A 6 digit one-time password sent to an email address.
   */
  email_otp_code?: string;
  /**
   * A 6 digit one-time password sent to an email address.
   */
  email_verification_code?: string;
  /**
   * Ip address (ipv4 or ipv6) of the client making the request. For logging and anomaly detection.
   */
  remote_addr?: string;
  /**
   * User-Agent string as provided from the original browser client that made the request, if any.
   */
  user_agent?: string;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This is the request body used by the HTML form submission for creating new groups
 */
export interface GroupNewFormBody {
  nickname: string;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * The body of a PATCH call on a group. This PATCH request lets you add or remove members from a group
 */
export interface GroupPatch {
  operation: "add-member" | "remove-member";
  /**
   * A URI pointing to a user. This can be specified as a mailto: address, a relative URI pointing to the user resource or an absolute URI
   */
  memberHref: string;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * A group can contain apps, users and other gruops and lets you assign privileges to all its members.
 */
export interface Group {
  /**
   * HAL Links
   */
  _links?: {
    [k: string]: unknown;
  };
  /**
   * Human-readable displayname.
   */
  nickname: string;
  /**
   * Creation date and time.
   */
  createdAt: string;
  /**
   * Last time the group was modified.
   */
  modifiedAt: string;
  /**
   * Ether 'user', 'app' or 'group'
   */
  type: "group";
  privileges: {
    [k: string]: string[];
  };
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This is the request body used for editing principals.
 */
export interface PrincipalEdit {
  _links?: unknown;
  nickname: string;
  active: boolean;
  type: "user" | "app" | "group";
  createdAt?: {
    [k: string]: unknown;
  };
  modifiedAt?: {
    [k: string]: unknown;
  };
  privileges?: {
    [k: string]: unknown;
  };
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Patch format for the principal-identity resource
 */
export interface PrincipalIdentityPatch {
  isMfa: string;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This is the form submitted by the user when they are verifiying an identity.
 */
export interface PrincipalIdentityVerifyForm {
  /**
   * The verification code
   */
  code: string;
  /**
   * If verification was successful, turn on MFA for this identity.
   */
  enableMfa?: boolean;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This object represents an identity associated with a principal. For example, this could be an email associated with a user. Identities can be verified, can be used as MFA devices and always have a URI, such as a mailto: or tel: uri.
 */
export interface PrincipalIdentity {
  _links?: unknown;
  /**
   * The user-supplied label asssociated with the identity. For example 'home phone'
   */
  label?: string;
  /**
   * If set to true this is considered the main identity.
   */
  isPrimary: boolean;
  /**
   * If set to true, this identity may be used as an MFA device
   */
  isMfa?: boolean;
  /**
   * Time when the identify was last verified. null if the identity is not verified.
   */
  verifiedAt?: string | null;
  /**
   * Time when the identify resource was created.
   */
  createdAt?: string;
  /**
   * Time when the identify resource was last modified.
   */
  modifiedAt?: string;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This is the request body used to create new principals
 */
export interface PrincipalNew {
  _links?: unknown;
  nickname: string;
  /**
   * Deprecated: If set, and when an identity href is passed when creating a user, this automatically sets that identity as 'verified'. This flag exists to replicate the behavior of older a12n-server versions when email verification was handled through the 'active' flag. This will be fully ignored in a future version and eventually removed.
   */
  active?: boolean;
  type: "user" | "app" | "group";
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This object is a request body for patching a principal's ACL.
 */
export interface PrincipalPatchPrivilege {
  /**
   * Indicates that a privilege was added
   */
  action: "add";
  /**
   * The name of the privilege, for example 'write' or 'read'
   */
  privilege: string;
  /**
   * The resource on which the user is receiving the privilege for. This should be a URI or '*'
   */
  resource: "*" | string;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This object contains the list of permissions/scopes that the user has granted to an app. The app may act on behalf of the user for these scopes.
 */
export interface UserAppPermissions {
  /**
   * HAL Links
   */
  _links?: {
    [k: string]: unknown;
  };
  /**
   * List of scopes that were granted to the app
   */
  scope: string[];
  /**
   * The date/time when the user first granted privileges to the app.
   */
  createdAt: string;
  /**
   * The date/time when the list of scopes was last updated.
   */
  modifiedAt: string;
  /**
   * The last time an access token was generated or refreshed by this app, for this user.
   */
  lastUsedAt: string | null;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This object describes the JSON repsentation of a PUT request on a user. It's mostly similar to the user schema, but with some fields not required.
 */
export interface UserEdit {
  /**
   * HAL Links
   */
  _links?: {
    [k: string]: unknown;
  };
  /**
   * Human-readable displayname for the user.
   */
  nickname: string;
  /**
   * If false, the user will not be able to log in.
   */
  active: boolean;
  /**
   * End-User's full name in displayable form including all name parts, possibly including titles and suffixes, ordered according to the End-User's locale and preferences.
   */
  name?: string;
  /**
   * Given name(s) or first name(s) of the End-User.
   */
  givenName?: string | null;
  /**
   * Middle name(s) of the End-User.
   */
  middleName?: string | null;
  /**
   * Surname(s) or last name(s) of the End-User.
   */
  familyName?: string | null;
  /**
   * End-User's birthday, represented in YYYY-MM-DD format.
   */
  birthdate?: string | null;
  address?: {
    /**
     * Street address. This property can be specified as an array to add multiple address lines.
     */
    streetAddress: string[];
    /**
     * City or locality component.
     */
    locality: string | null;
    /**
     * State, province, prefecture, or region component. Should be specified as a code for countries where this is applicable.
     */
    region: string | null;
    /**
     * Zip code or postal code component.
     */
    postalCode: string | null;
    /**
     * Country, specified as an ISO 3166-1 alpha-2 country code. (e.g.: 'CA' or 'NL')
     */
    country: string | null;
  } | null;
  /**
   * End-User's preferred locale. This should follow the BCP47 format.
   */
  locale?: string | null;
  /**
   * String from the IANA Time Zone Database representing the End-User's time zone. For example, 'Europe/Amsterdam' or 'America/Los_Angeles'.
   */
  zoneinfo?: string | null;
  /**
   * Arbitrary meta-data storage. This can be used for any other values the client may want to store.
   */
  metadata?: {
    [k: string]: string;
  };
  /**
   * Creation date and time.
   */
  createdAt?: string;
  /**
   * Last time the user was modified.
   */
  modifiedAt?: string;
  /**
   * May be 'user', 'app' or 'group'
   */
  type?: "user";
  /**
   * List of privileges. This object gets ignored in PUT requests and exists so API clients can GET a full user object, make their changes and then send it in the same shape.
   */
  privileges?: {
    [k: string]: string[];
  };
  /**
   * @deprecated
   * Does the user have a password set? This will be removed in a future version. Use the authFactors resource instead.
   */
  hasPassword?: boolean;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This is the request body used by the HTML form submission for creating new users
 */
export interface UserNewFormBody {
  nickname: string;
  email: string | "";
  /**
   * Automatically mark email address as validated. Should be Javacript thruthy string.
   */
  markEmailValid: string;
  /**
   * Request a password to be generated. Should be a Javascript thruthy string.
   */
  autoGeneratePassword?: string;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * After a user is created, this object will be returned to the client. It's mostly similar to the regular "user" object, with some modifications.
 */
export interface UserNewResult {
  /**
   * HAL Links
   */
  _links?: {
    [k: string]: unknown;
  };
  /**
   * Human-readable displayname for the user.
   */
  nickname: string;
  /**
   * If false, the user will not be able to log in.
   */
  active: boolean;
  /**
   * Creation date and time.
   */
  createdAt: string;
  /**
   * Last time the user was modified.
   */
  modifiedAt: string;
  /**
   * May be 'user', 'app' or 'group'
   */
  type: "user";
  /**
   * Password for the newly created user. This password will only be displayed this one time. You are recommended to change the password immediately after.
   */
  password?: string;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * A user
 */
export interface User {
  /**
   * HAL Links
   */
  _links?: {
    [k: string]: unknown;
  };
  /**
   * Human-readable displayname for the user.
   */
  nickname: string;
  /**
   * If false, the user will not be able to log in.
   */
  active: boolean;
  /**
   * End-User's full name in displayable form including all name parts, possibly including titles and suffixes, ordered according to the End-User's locale and preferences.
   */
  name: string;
  /**
   * Given name(s) or first name(s) of the End-User.
   */
  givenName: string | null;
  /**
   * Middle name(s) of the End-User.
   */
  middleName: string | null;
  /**
   * Surname(s) or last name(s) of the End-User.
   */
  familyName: string | null;
  /**
   * End-User's birthday, represented in YYYY-MM-DD format.
   */
  birthdate: string | null;
  address: {
    /**
     * Street address. This property can be specified as an array to add multiple address lines.
     */
    streetAddress: string[] | null;
    /**
     * City or locality component.
     */
    locality: string | null;
    /**
     * State, province, prefecture, or region component. Should be specified as a code for countries where this is applicable.
     */
    region: string | null;
    /**
     * Zip code or postal code component.
     */
    postalCode: string | null;
    /**
     * Country, specified as an ISO 3166-1 alpha-2 country code. (e.g.: 'CA' or 'NL')
     */
    country: string | null;
  } | null;
  /**
   * End-User's preferred locale. This should follow the BCP47 format.
   */
  locale?: string | null;
  /**
   * String from the IANA Time Zone Database representing the End-User's time zone. For example, 'Europe/Amsterdam' or 'America/Los_Angeles'.
   */
  zoneinfo: string | null;
  /**
   * Arbitrary meta-data storage. This can be used for any other values the client may want to store.
   */
  metadata: {
    [k: string]: string;
  };
  /**
   * Creation date and time.
   */
  createdAt: string;
  /**
   * Last time the user was modified.
   */
  modifiedAt: string;
  /**
   * May be 'user', 'app' or 'group'
   */
  type: "user";
  privileges: {
    [k: string]: string[];
  };
  /**
   * @deprecated
   * Does the user have a password set? This will be removed in a future version. Use the authFactors resource instead.
   */
  hasPassword: boolean;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Request body of the exchange one-time-token endpoint.
 */
export interface VerificationTokenExchangeRequest {
  /**
   * The token previously obtained with the 'generate one-time-token' endpoint.
   */
  token: string;
  /**
   * The OAuth2 client_id. This client will be associated with the generated token.
   */
  client_id: string;
  /**
   * Activate the user if the token was valid.
   */
  activateUser?: boolean;
  /**
   * Don't expire the one-time-token even if it was correct.
   */
  dontExpire?: boolean;
}
/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * The request made to the one-time-token generate endpoint.
 */
export interface VerificationTokenGenerateRequest {
  /**
   * Specify how long the token is valid for, in seconds.
   */
  expiresIn?: number;
  /**
   * If set, the token will be associated with a specific email address or phone number. When this token is validated later, the email address or phone number will be marked as 'verified' for the user.
   */
  identity?: string;
}
