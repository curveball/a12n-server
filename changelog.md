Changelog
=========

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
