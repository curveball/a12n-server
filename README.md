`@curveball/a12n-server`: A simple authentication server
==================

*a12n* is short for "authentication".

`a12n-server` is a simple authentication server that implements the OAuth2 and OpenID Connect standards.
It's goals is to create a fast, lightweight server that can be quickly deployed on both dev machines and
in production.

![a12n-server home screenshot](https://raw.githubusercontent.com/curveball/a12n-server/master/docs/screenshot-0.27.png)

Requirements
------------

* Node.js 18.x
* MySQL, Postgres or Sqlite

Try it out!
-----------

Get a test server by running:

```sh
mkdir a12n-server && cd a12n-server
npx @curveball/a12n-server
```

This will automatically create a configuration file and sqlite database in the
current directory.

Then, just open [http://localhost:8531/](http://localhost:8531/) to create your admin account. 
See [Getting started](/docs/getting-started.md) for more ways to run the server.

Thinking about contributing? 

Try [running from source](/docs/getting-started.md#running-from-source-locally) or [running with Docker](/docs/getting-started.md#running-with-docker-compose)

🍭 Features
-------

This project has been used in production since 2018 and actively maintained.

Instead of rolling your own authentication system, you get *A LOT* of features for free 🪄:

The server supports core features such as:

* A User API that can be used to create, update, delete and list users.
* User registration, login, lost password.
* Multi-factor auth including
  * TOTP (Google Authenticator)
  * Email one-time passcodes.
  * Hardware keys support (WebauthN)
* Groups (roles) and permissions that can be assigned to users or groups.
* A browser-based admin interface.
* A REST API that can be traversed using a standard browser, as it spits out
  both JSON and HTML.

The server supports OAuth2 and OpenID Connect, with support for the following features and standards:

* Authorization code, client credentials, password and implicit grants.
* [OAuth2 discovery document][1] and OpenID Connect configuration endpoint.
* [OAuth 2 Token Introspection][2].
* [JSON Web Key Sets][4].
* [OAuth2 Token Revocation][5]
* [RFC 9068][7] - JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens.
* [PKCE][3].
* [OAuth 2.0 Multiple Response Type Encoding Practices](https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html)


📂 Documentation
-------------
- 🚀 [Getting started](/docs/getting-started.md)
- 🛠️ [Configure the server](/docs/server-settings.md)
- 🔗 [Integrate with a browser client](/docs/integration.md)
- 🔍 [Manage users with our APIs](/docs/user-api.md)


[📝 Contribution Guidelines](/.github/CONTRIBUTING.md) | [📰 Code of Conduct](/.github/CODE_OF_CONDUCT.md)


[1]: https://tools.ietf.org/html/rfc8414 "OAuth 2.0 Authorization Server Metadata"
[2]: https://tools.ietf.org/html/rfc7662 "OAuth 2 Token Introspection"
[3]: https://tools.ietf.org/html/rfc7636 "Proof Key for Code Exchange by OAuth Public Clients"
[4]: https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets
[5]: https://datatracker.ietf.org/doc/html/rfc7009
[6]: https://datatracker.ietf.org/doc/html/rfc8959
[7]: https://www.rfc-editor.org/rfc/rfc9068 "JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens"
