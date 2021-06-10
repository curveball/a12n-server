Changelog
=========

0.19.5 (????-??-??)
-------------------

* Don't show 'remove member' form on groups if there are no members.


0.19.4 (2021-05-31)
--------------------

* Fix link to schema collection on home document.
* Add Curl to Docker image as it's a common health check tool.
* Fix a bug that preventing using `PATCH on /group/:id` in the HAL browser.


0.19.3 (2021-05-30)
-------------------

* Make sure that the `/health` endpoint also gets logged correctly.


0.19.2 (2021-05-28)
-------------------

* Fix: bug in JSON schema for group members. Inconsistent property
  names.
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

* `updatePassword` now supports creating a password without having an
  existing password.


0.18.2 (2021-04-15)
-------------------

* Activating users did not correctly check for "admin" privileges. This is
  now fixed.
* Added support for `PUT` on `/users/123`
* Allowing users to be activated using the `token-exchange` API.


0.18.1 (2021-04-05)
-------------------

* Url decode the 'href' on the `/user/byhref` endpoint.
* Make the 'privilege policy' textarea bigger.


0.18.0 (2021-04-05)
-------------------

* Added UIs for editing user information. (@mihok)
* Added preliminary support for JWT bearer tokens ([draft-ietf-oauth-access-token-jwt-12][oauth2-jwt]).
* Added a new markdown-based home document, which will be a bit more user-
  friendly for non-devs.
* Added UI for setting privileges. (@mihok)
* All secret tokens are now URL-safe and generated non-blocking.
* Throw a 404 when trying to access the 'active sessions' page for a
  group-principal.


0.17.2 (2021-03-26)
-------------------

* Added a `/user/:id/password` endpoint. This allows an admin to easily
change a user's password.


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
* Added a `/user/by-href/:href` endpoint, allowing API clients to look up
  users by their 'identity' like their email address.
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
* Added an 'access token' endpoint, allowing you to generate a new access
  token if you had an already valid session.


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
------------------

* Added one-time-token API, allowing clients to get temporary login tokens for
  use with lost-password emails, invite emails.


0.15.1 (2021-02-18)
-------------------

* When updating the list group members, it's now possible to specify members
  by using absolute URIs.
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
* The 'logout' feature will now expire any OAuth2 codes and tokens if they
  were initiated by the current browser session.
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
* Better error messaging in the OAuth2 flow when a `redirect_uri` is
  incorrect.


0.13.0 (2020-09-29)
-------------------

* Support for WebauthN / Yubikeys (@mhum)
* Logging in is now a multi-step process, with 2FA (Webauthn/Yubikey/TOTP)
  as the second step. (@mhum)
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

* Now using `@curveball/accesslog`, which also colorizes CLI output when
  viewed on a terminal.
* A list of privileges are now returned from the 'introspect' endpoint.
* An error will be thrown when the server is used as a middleware (instead
  of standalone) and no `PUBLIC_URI` environment variable is set.


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

* Added a `/privileges` endpoint to easily find out what kind of privileges
  are used in the system.
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
* BC break: Links such as `sa:logout`, `sa:token`, `sa:validate-bearer` now
  all have their `sa:` prefix dropped.
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
* A database bug: not enough space for creating OAuth2 clients that have
  access to many grant types.


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
*  The token endpoint now returns cors headers.


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

* The entire application now also exposes itself as a middleware, so it
  can be customized and integrated into other curveball apps.


0.3.1 (2018-11-01)
------------------

* First public version

[oauth2-jwt]: https://tools.ietf.org/html/draft-ietf-oauth-access-token-jwt-12
