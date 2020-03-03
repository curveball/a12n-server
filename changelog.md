Changelog
=========

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
