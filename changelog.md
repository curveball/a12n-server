Changelog
=========

0.24.0-alpha.1 (2023-10-05)
---------------------------

* The Docker distribution now runs on Node 20 (upgraded from 16).
* Fixed a 500 error in the OAuth2 password flow.
* Updated to simplewebauthn 8.
* Upgrade to Redis 4.
* Improve user audit logging for various OAuth2 flows.
* Use SQLite3 WAL mode for better concurrency.


0.24.0-alpha.0 (2023-10-04)
---------------------------

* Update to curveball 0.21
* Refactored the privilege system to make internally easier to use. There
  should be no end-user effects to this.
* Added a system group principal , which allows admins to set privileges for
  every user in the system.
* Fix Sqlite startup warning.
* The `/group/x/members` collection and associated operations and links have
  been removed. This endpoint had been marked deprecated in version 0.19 in May
  2021 and is now finally removed. If you still depended on this endpoint, all
  the related information can be found on the /group/x endpoint. This endpoint
  also has operations for modifying the members list.
* By default this server will no longer allow new users and apps to see the
  full list of other users, groups and apps. Any applications relying on this
  behavior need to give the relevant users the `a12n:principals:list`
  privilege. To get the old behavior, simply add this privilege to the new
  `$all` group.
* When a user goes from login to registration, the "continue" link will be
  remembered.
* The 'password' flow now also tracks apps that are granted access to user
  accounts
* When using the Redis session backend, CSRF tokens would not get stored
  correctly, causing some browser operations to fail.
* a12n-server will now report a better process name in linux process lists.
* The server now picks up the `CURVEBALL_ORIGIN` environment variable.


0.23.1 (2023-03-29)
-------------------

* Fix 500 error on /authorize endpoint when using Sqlite
* Fix CSRF error on create user form


0.23.0 (2022-01-12)
-------------------

* Update knex. Knex had a massive SQL injection vulnerability.
* 'scope' wasn't supported yet correctly in the `authorization_code` and
  `implicit` flows.
* Fixed some bugs in the 'active sessions' report, and add columns for
  `grant_type`, and `scope`.
* Common types, such `User`, `App`, `Group` types have been moved to
  `src/types.ts` for easier access.
* We're now keeping track of which scopes were granted to which apps per user.
* Support for RFC 9068: A standard format for JWT OAuth2 Access Tokens.
* Centralize CSRF token handling (for old browsers).
* Added a new 'add privilege' action, which is helpful for API clients.
* Fix bug: Incorrect url in `Location` header when creating a new user.
* #448: Fix 'create group' form.


0.22.0 (2022-09-27)
-------------------

Warning note for upgraders. This release has a database migration on the
`oauth2_tokens` table. For most users this is the largest table, some downtime
may be expected while the server runs its migrations.

* #425: Using a `client_secret` is now supported with `authorization_code`, and
  it's read from either the request body or HTTP Basic Authorization header.
* The service now keeps track when issuing access tokens, whether those tokens
  have used a `client_secret` or not, which `grant_type` was used to issue them
  and what scopes were requested. This work is done to better support OAuth2
  scopes in the future, and eventually OpenID Connect.
* Fixed broken 'principal uri' in introspection endpoint response.
* OAuth2 service is almost entirely rewritten.
* The number of tokens issued is now displayed on the home page.
* Large numbers are now abbreviated with `K` and `M`.
* #426: Updated to Curveball 0.20.
* #427: Typescript types for the database schema are now auto-generated with
  `mysql-types-generator`.


0.21.3 (2022-08-09)
-------------------

* It's now possible to generate a URI that completely takes a developer through
  the setup process for creating an OAuth2 client, with all values pre-filled.
  This makes it very easy for a developer to get their environment up and
  running without having to know all kinds of OAuth2 details (@AminDhouib).
* Fixed getting no feedback after changing group members. (@AminDhouib)
* Fixed the 'authenticated-as' link in the a12n-server home document; it had an
  extra slash.
* If you hit an authenticated page after login, you are now redirected back to
  that page after login.
* The `/register` endpoint can now take a `?continue=` uri parameter, making it
  possible to redirect back to any application after registering.


0.21.2 (2022-07-27)
-------------------

* Adding `schemas` and `.env.defaults` to the NPM package.


0.21.0 (2022-07-27)
-------------------

* New! Start a fresh a12nserver just by running `npx @curveball/a12n-server`
* #412: Fixed a few more PostgreSQL bugs (@AminDhouib)
* #407: Users can be added to groups again with their relative URI
  (@AminDhouib)
* #399: When trying to add a new OAuth2 client with an existing `client_id`,
  the server will now emit a 409 instead of a 500 error. (@AminDhouib)
* The `requirePkce` flag was not respected when creating a new OAuth2 client.


0.20.4 (2022-06-19)
-------------------

* #398: Allow the HTTP/1.1 KeepAlive timeout to be configured using the
  `KEEP_ALIVE_TIMEOUT_MS` environment variable. (@pschwyter)
* #397: Add `REDIS_PASSWORD` environment variable to support password-protected
  redis servers. (@mihok)
* #400: Fix bug in the 'create app' form.
* #402: Add form for editing settings on OAuth2 clients.
* #401: Add schemas for user, app and group endpoints.


0.20.3 (2022-06-03)
-------------------

* Hide database settings from 'settings page'.


0.20.2 (2022-05-26)
-------------------

* Released with Alpha tag.
* Fix: Parsing HTTP Basic header containing a `:` in the password. This is
  heavily used in server-to-server oauth2 flows. (@pschwyter)
* Automatically open a debug connection on port 9339 when running with `make
  start-dev`. (@pschwyter)

🛳️ Ahoi from Halifax! 🛳️


0.20.1 (2022-05-17)
-------------------

* Released with Alpha tag.
* `MYSQL_PORT` and `MYSQL_HOST` were ignored. These settings now exist for
  backwards compatibility, but the backwards compatibility settings had a bug.


0.20.0 (2022-05-17)
-------------------

* Released with Alpha tag.
* Now requires Node 16.
* Postgres support! (@mihok)
* Experimental sqlite support.
* Migrated all database access to Knex.
* Database migrations are now automatically run on startup, making upgrades a
  lot easier.
* Support for the `/.well-known/jwks.json` endpoint, allowing clients to
  discover JWT public keys.
* OAuth2 secrets are now prefixed with the `secret-token:` uri scheme, allowing
  github and other systems to detect possible commits of secret data.
* A new settings panel for admins, allowing admins to see exactly which
  settings have been applied. This is currently read-only.
* `.env.defaults` is no longer automatically loaded. The file still exists but
  its only purpose is to provide a template for developers to copy to `.env`.
* Updated 'create group' and 'create app' forms to be simpler.
* Show the public url when starting the server instead of just the TCP port.
* #382: Fix buggy email layout.


0.19.12 (2022-01-12)
--------------------

* This release reinstates the v0.19.10 changes after `@curveball/browser`
  received an updated logo.


0.19.11 (2022-01-07)
--------------------

* This release rolls back the 'app logo' feature. The default setting has
  cosmetic bugs.


0.19.10 (2022-01-07)
--------------------

* Add app logo to login, registration, lost-password pages.
* The 'Change password' form now lives on `/change-password` instead of
  `/changepassword` for consistency with other routes.
* Small fixes (Bad Gateway copyright notice, copy changes + new cancel button
  on reset password page).
* Update dependencies.


0.19.9 (2021-10-18)
-------------------

* Halloween theme. Automatically enabled the last week of October.
* #295: Improved validation for `identity` field on users, groups and apps.


0.19.8 (2021-09-09)
-------------------

* Don't show 'remove member' form on groups if there are no members.
* The 'create member' API can now also read links from HAL bodies.


0.19.7 (2021-06-10)
-------------------

* Group members are now sorted alphabetically by 'nickname'.
* Updated dependencies.


0.19.6 (2021-06-10)
-------------------

* This release was botched, do not upgrade to this.


0.19.5 (2021-06-10)
-------------------

* This version was never released.


0.19.4 (2021-05-31)
-------------------

* Fix link to schema collection on home document.
* Add Curl to Docker image as it's a common health check tool.
* Fix a bug that preventing using `PATCH on /group/:id` in the HAL browser.


0.19.3 (2021-05-30)
-------------------

* Make sure that the `/health` endpoint also gets logged correctly.


0.19.2 (2021-05-28)
-------------------

* Fix: bug in JSON schema for group members. Inconsistent property names.
* Renamed userHref to memberHref.


0.19.1 (2021-05-28)
-------------------

* Fix: bug in JSON schema for editing group members.
* @curveball/validator had a critical bug that caused error handling to break
  for validation errors.


0.19.0 (2021-05-27)
-------------------

* Redesigned home page.
* A drastically smaller Docker image. The uncompressed image size dropped from
  1.2G to 267M due to the use of multi-stage builds.
* Apps now appear in `/app` and no longer in `/user`.
* Groups now appear in `/group` and no longer in `/user`.
* HAL forms for adding and removing members to groups.
* Renamed 'users' to 'principals' in many places in the source, including
  database tables.
* Clean up line endings from `JWT_PRIVATE_KEY` if they are not in the expected
  format. This will make it work better with at least AWS Secure Parameter
  Store / ECS / Lambda.
* First steps to integrating json-schema in a12nserver.


0.18.3 (2021-04-20)
-------------------

* `updatePassword` now supports creating a password without having an existing
  password.


0.18.2 (2021-04-15)
-------------------

* Activating users did not correctly check for "admin" privileges. This is now
  fixed.
* Added support for `PUT` on `/users/123`
* Allowing users to be activated using the `token-exchange` API.


0.18.1 (2021-04-05)
-------------------

* Url decode the 'href' on the `/user/byhref` endpoint.
* Make the 'privilege policy' textarea bigger.


0.18.0 (2021-04-05)
-------------------

* Added UIs for editing user information. (@mihok)
* Added preliminary support for JWT bearer tokens
  ([draft-ietf-oauth-access-token-jwt-12][oauth2-jwt]).
* Added a new markdown-based home document, which will be a bit more user-
  friendly for non-devs.
* Added UI for setting privileges. (@mihok)
* All secret tokens are now URL-safe and generated non-blocking.
* Throw a 404 when trying to access the 'active sessions' page for a
  group-principal.


0.17.2 (2021-03-26)
-------------------

* Added a `/user/:id/password` endpoint. This allows an admin to easily change
  a user's password.


0.17.1 (2021-03-14)
-------------------

* Updated `simplewebauthn` dependencies to the latest version.
* Switched to 'indirect' attestation-type by default, allowing anomimized
  attestations to be used.
* It's now possible to set the value for the CORS `Allow-Origin` option. By
  default it's enabled, but if `cors.allowOrigin` is supplied, this can be
  overridden.


0.17.0 (2021-03-11)
-------------------

* Privileges assigned to groups are now inherited by all users who are part of
  that group, allowing the use of groups as 'roles'.
* Added a `/user/by-href/:href` endpoint, allowing API clients to look up users
  by their 'identity' like their email address.
* Added a `hasPassword` property to each user. This is only visible on 'your
  own' user or if you are an admin.
* The `/token-exchange` endpoint for one-time tokes now requires a `client_id`
  parameter, similar to OAuth2 endpoints.
* Fixed a number of internal APIs that let people generate passwords for non-
  user principals, or oauth2 credentails for groups. Everything is a bit
  stricter.
* Internally, 'users', 'apps' and 'groups' are now more often referred to by
  the name 'principal'. Before, these 3 categories of things were also referred
  to as 'user'. This migration is not complete, but it's a big first step.
  Eventually we'll have separate API roots for each of these.


0.16.0 (2021-03-07)
-------------------

* Added a `login.defaultRedirect` option. This setting allows an admin to
  specify where users should be redirected to after they log in.
* Added a 'one time token' API, allowing privileged clients to exchange tokens
  with regular OAuth2 access tokens. This is useful for custom implementations
  of 'lost password' features.
* Added an 'active sessions' API. This API lists all currently active
  access/refresh tokens for a user.
* Added an 'access token' endpoint, allowing you to generate a new access token
  if you had an already valid session.


0.15.5 (2021-02-23)
-------------------

* Another re-release to try and make Github npm packages function.


0.15.4 (2021-02-23)
-------------------

* This package is now published on npm under `@curveball/a12n-server`.


0.15.3 (2021-02-23)
-------------------

* Re-releasing to for Github auto-publishing npm packages.


0.15.2 (2021-02-23)
-------------------

* Added one-time-token API, allowing clients to get temporary login tokens for
  use with lost-password emails, invite emails.


0.15.1 (2021-02-18)
-------------------

* When updating the list group members, it's now possible to specify members by
  using absolute URIs.
* Updated to latest curveball APIs


0.15.0 (2021-02-02)
-------------------

* Added a 'first run' interface. If no users exist in the system at all,
  a12nserver will now drop you in a 'create admin user' interface, making the
  initial setup a LOT simpler.
* Updated the 'create oauth2 credentials' form to be more userfriendly.
* Fixed OAuth2 error responses.
* Added APIs for replacing the member list of a group (`PUT`).
* Added API for adding a member to a group (`POST`).
* Improved some of the installation instructions.
* Added a link from the users page back to the users list.


0.14.4 (2020-12-16)
-------------------

* Now supports Redis as a backend for session storage, which should make this
  server a lot better when load balanced on several machines.


0.14.3 (2020-12-16)
-------------------

* Updating dependencies


0.14.2 (2020-12-14)
-------------------

* #214: `continue` url was not being respected in the logout flow.


0.14.1 (2020-12-04)
-------------------

* Updated all dependencies, fixing a highlight.js security issue.
* Small tweaks to home document.


0.14.0 (2020-11-20)
-------------------

* Now requires Node 14, due to the use of `fs/promises`.
* The 'logout' feature will now expire any OAuth2 codes and tokens if they were
  initiated by the current browser session.
* The 'logout' endpoint now has support for a `continue` query parameter, to
  let the user get redirected back to a new endpoint after logout.
* Now using an 'ip to country' database to figure out where users are logging
  in from, to aid with intrusion detection features if these ever land.
* A new system that will warn the user and prevent starting if some of the
  database patches have not been applied.
* New database patches! Apply them before starting the new version.


0.13.6 (2020-11-20)
-------------------

* New tags for semver versions on hub.docker.io.
* Ability to specify a 'continue' URI when logging out.


0.13.5 (2020-10-27)
-------------------

* `dotenv` and `dotenv-defaults` were incorrectly marked as dev dependencies.


0.13.4 (2020-10-27)
-------------------

* `dotenv` is used for setting environment variables in development
  environments.
* Added an API and simple interface for seeing OAuth2 clients and adding new
  ones.
* Fixed a bug related to the OAuth2 `authorization_code` flow that prevented
  completing the process if the user used an incorrect password the first time.


0.13.3 (2020-10-03)
-------------------

* Redirect check was broken.


0.13.2 (2020-10-02)
-------------------

* Fixed Webauthn origin/host auto-detect.


0.13.1 (2020-10-02)
-------------------

* Docker build can now fully run without a pre-existing development
  environment.
* Public Docker Image: https://hub.docker.com/r/curveballjs/a12n-server
* WebauthN and TOTP MFA are now enabled by default.
* No longer using `unpkg` for browser dependencies.
* Upgraded from `hal-browser` to `@curveball/browser`.
* Better error messaging in the OAuth2 flow when a `redirect_uri` is incorrect.


0.13.0 (2020-09-29)
-------------------

* Support for WebauthN / Yubikeys (@mhum)
* Logging in is now a multi-step process, with 2FA (Webauthn/Yubikey/TOTP) as
  the second step. (@mhum)
* It's now possible to setup 2FA during registration. (@mhum)
* `/validate-bearer` and `/validate-totp` endpoints have been removed.
* Support for OAuth2 PKCE (@mhum)
* tslint -> eslint
* Typescript 4.
* Compatible with Typescript strict mode.


0.12.7 (2020-04-28)
-------------------

* Update all dependencies


0.12.6 (2020-03-04)
-------------------

* `PUBLIC_URI` is now correctly being auto-detected if it was not set in the
  environment in standalone mode.
* Improved error messaging when the server fails to start.


0.12.5 (2020-03-03)
-------------------

* Now using `@curveball/accesslog`, which also colorizes CLI output when viewed
  on a terminal.
* A list of privileges are now returned from the 'introspect' endpoint.
* An error will be thrown when the server is used as a middleware (instead of
  standalone) and no `PUBLIC_URI` environment variable is set.


0.12.4 (2020-03-02)
-------------------

* Added user links to accessToken


0.12.3 (2020-03-02)
-------------------

* Added user links URL to introspect for 'authenticated-as' link


0.12.2 (2020-03-02)
-------------------

* bad release, please ignore


0.12.1 (2020-01-22)
-------------------

* Bug fix. For curveball-session shouldn't have been dev dependency.


0.12.0 (2020-01-22)
-------------------

* Added a `/privileges` endpoint to easily find out what kind of privileges are
  used in the system.
* The server now has an `admin` privilege, which is required to create new
  users or find information about other users.
* Users that are not yet marked `active` now show up in the `/users`
  collection, but still can't log in.
* The session cookie now uses `SameSite: Lax`, which means that users will see
  login screens less often.


0.11.2 (2019-12-30)
-------------------

* Support for the `/.well-known/change-password` endpoint, as defined in
  RFC8615.
* Fixed a bug that could cause the TOTP field to not be rendered, even if it's
  required.
* Fixed a bug where users weren't getting activated using the "Create user"
  form.


0.11.1 (2019-12-17)
-------------------

* Last release broke the OAuth2 authorization endpoint.


0.11.0 (2019-12-17)
-------------------

* Support for a new user type: 'group'. Groups can contain users and will in a
  future release allow roles to be created with privileges that can be applied
  to entire groups.
* TOTP can now be set to 'required', 'optional' and 'disabled' via a server-
  wide flag.
* OAuth2 access, refresh and authorization code expiry times are now
  configurable.
* Better design for notifications vs. error messages.
* It's now possible for an admin to create new users via an API or form.
* It's now possible to authenticate with the a12nserver via a Bearer token,
  allowing clients to directly call a12nserver APIs.
* The OAuth2 login flow now also shows the lost password and registration
  links, if they were enabled.


0.10.2 (2019-11-11)
-------------------

* Fix a small bug in the `/introspect` endpoint. Successful responses were not
  returning.


0.10.1 (2019-11-11)
-------------------

* Fixed a small CSS layout bug on login.
* /introspect endpoint now doesn't require login.


0.10.0 (2019-11-11)
-------------------

* Added a 'lost password' feature that uses email for validating using
  accounts.
* The audit log now tracks the 'User agent'.
* Better autocomplete hints on the login and registration form for password
  managers.


0.9.1 (2019-10-09)
------------------

* Fixed a bug in authenticating via OAuth2


0.9.0 (2019-10-09)
------------------

* New design! Thank you @ikbensiep
* Change password feature
* TOTP is now also no longer a requirement for OAuth2 sign-ins. It's only
  optional if TOTP was not set up by a user.


0.8.0 (2019-10-02)
------------------

* Support for RFC7662 Token Introspection.
* Login form will now have a link to the registration screen, if registration
  was enabled.
* Small design tweaks in Login screen.
* BC break: Links such as `sa:logout`, `sa:token`, `sa:validate-bearer` now all
  have their `sa:` prefix dropped.
* The 'validate-bearer' endpont is now deprecated, as the the token
  introspection endpoint has the same features.


0.7.0 (2019-09-25)
------------------

* Update all dependencies.
* Added a 'confirm password' field during registeration.
* TOTP is now optional if no TOTP token was set for a user.


0.6.0 (2019-07-30)
------------------

* Added a registration form
* Added a simple settings system.
* Now using `@curveball/problem` for error handling.
* Added support for resource-specific privileges, allowing users to store
  privileges based on arbitrary urls.


0.5.0 (2019-05-02)
------------------

* Added a user log with all login attempts
* Switched to `@curveball/controller` for all controllers, simplifying the
  source a bit.
* Better installation documentation.
* A database bug: not enough space for creating OAuth2 clients that have access
  to many grant types.


0.4.4 (2019-03-27)
------------------

* An expired refresh token should return `invalid_grant` and not
  `invalid_request.`
* Default refresh token lifetime is now set to 6 hours.


0.4.3 (2019-03-18)
------------------

* Removed a duplicated validator.


0.4.2 (2019-03-18)
------------------

* When a token is being refreshed, but the refresh_token is invalid, we're now
  sending back a standard OAuth2 error response.


0.4.1 (2019-03-14)
------------------

* `refresh_token` can now be used without a client secret.
* `authorization_code` no longer requires a client secret.
* `authorization_code` grant now returns a refresh token.
* The token endpoint now returns cors headers.


0.4.0 (2019-03-12)
------------------

* Default port is `8531`.
* Added a 'Getting started' guide.
* Added all database schemas to set up a new server.
* The `password` grant type is now supported.
* Refreshing tokens now works.
* The `allowed_grant_types` is now actively enforced for every client.
* Returning correct OAuth2 error responses for more internal errors.


0.3.5 (2019-01-31)
------------------

* If an unrecognized client_id was provided, the server returned a `404` error.
  This has been changed to `400`.


0.3.4 (2018-11-02)
------------------

* Fixed a bug that would cause sessions to be forgotten with every request.
* Removed a bunch of debug code.


0.3.3 (2018-11-01)
------------------

* Added a few missing files from npm distribution.
* Updated dependencies.


0.3.2 (2018-11-01)
------------------

* The entire application now also exposes itself as a middleware, so it can be
  customized and integrated into other curveball apps.


0.3.1 (2018-11-01)
------------------

* First public version

[oauth2-jwt]: https://tools.ietf.org/html/draft-ietf-oauth-access-token-jwt-12
