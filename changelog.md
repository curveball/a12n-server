Changelog
=========

0.5.1 (????-??-??)
------------------

* Added support for registration.
* Added a simple settings system.
* Now using `@curveball/problem` for error handling.


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
