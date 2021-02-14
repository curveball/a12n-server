Authentication API
==================

This package aims to provide a simple authentication system. The goal is to
provide a simple authentication system for developers considering building
their own.

The project implements OAuth2 standards where applicable.

Requirements
------------

* Node.js 14.x
* MySQL

Features
--------

* A simple browseable API.
* OAuth2
  * Supported grants: `implicit`, `client_credentials`, `authorization_code`
    and `password`.
  * [OAuth2 discovery document][1].
  * [PKCE][3].
  * [OAuth 2 Token Introspection][2].
* MFA
  * Google Authenticator (TOTP).
  * WebauthN / Yubikeys
* A simple, flat, permission model.
* Registration, lost password.

Documentation
-------------

Check out the [Docs folder](https://github.com/curveball/a12n-server/tree/master/docs)

The state of this project
-------------------------

If you are thinking of building a new authentication system, and decide to use
this project instead, you get a lot of features for free.

The project has been used in production since 2018 and is still actively
developed.


[1]: https://tools.ietf.org/html/rfc8414 "OAuth 2.0 Authorization Server Metadata"
[2]: https://tools.ietf.org/html/rfc7662 "OAuth 2 Token Introspection"
[3]: https://tools.ietf.org/html/rfc7636 "Proof Key for Code Exchange by OAuth Public Clients"
