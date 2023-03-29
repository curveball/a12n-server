Authentication API
==================

This package aims to provide a simple authentication system. The goal is to
provide a simple authentication system for developers considering building
their own.

The project implements OAuth2 standards where applicable.

![a12n-server home screenshot](https://raw.githubusercontent.com/curveball/a12n-server/master/docs/screenshot-0.19.png)

Requirements
------------

* Node.js 16.x
* MySQL, Postgres or Sqlite

Try it out!
-----------

You can quickly get a test server up and running by running these commands:

```sh
mkdir a12n-server
cd a12n-server
npx @curveball/a12n-server
```

This will automatically create a configuration file and sqlite database in the
current directory.

Then, just open [http://localhost:8531/](http://localhost:8531/) to create
your admin account.


Features
--------

* A simple browseable API.
* OAuth2
  * Supported grants: `implicit`, `client_credentials`, `authorization_code`
    and `password`.
  * [OAuth2 discovery document][1].
  * [PKCE][3].
  * [OAuth 2 Token Introspection][2].
  * [JSON Web Key Sets][4].
  * [OAuth2 Token Revocation][5]
  * [RFC 9068][7] - JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens
* MFA
  * Google Authenticator (TOTP).
  * WebauthN / Yubikeys
* A simple, flat, permission model.
* Registration, lost password.
* [`secret-token:` URI scheme][6]


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
[4]: https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets
[5]: https://datatracker.ietf.org/doc/html/rfc7009
[6]: https://datatracker.ietf.org/doc/html/rfc8959
[7]: https://www.rfc-editor.org/rfc/rfc9068 "JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens"
