Changelog
=========

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
