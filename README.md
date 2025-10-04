Project status update
---------------------

This project is being retired. I'm keeping this repository online so security bugs can be fixed, but
new projects should no longer rely on this.

When this project was created at the time, the space wasn't quite as crowded as it is now, and this
project never hit a level of popularity of contributions to justify continuing to work on this.

If you were a user or contributor in the past, thank you for your support! I hope you're not too
frustrated by this decision.

If you are looking for a similar project, I recommend checking out [Keycloak](https://www.keycloak.org/),
which is a very mature and feature-rich authentication server. The [OAuth2 website also has a list of
implementations](https://oauth.net/code/).


Intro
-----


*a12n* is short for "authentication".

`a12n-server` is a simple authentication server that implements the OAuth2 and OpenID Connect standards.
It's goals is to create a fast, lightweight server that can be quickly deployed on both dev machines and
in production.

![a12n-server home screenshot](https://raw.githubusercontent.com/curveball/a12n-server/master/docs/screenshot-0.27.png)

Requirements
------------

* Node.js > 18.x
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

### Contributing or just curious about the code?

[Run from source](/docs/getting-started.md#running-from-source-locally) or run the codebase [with Docker](/docs/getting-started.md#running-with-docker-compose)

🍭 Features
-----------

This project has been used in production since 2018 and continues to be actively maintained. 

Instead of rolling your own authentication system, you get *A LOT* of features for free 🪄:

| Supported Features | Details |
|---------|-------------|
| User Management | • Create, update, delete and list users with our [User API](/docs/user-api.md)<br>• Password reset/recovery flow |
| Authentication Methods | • Username/password login<br>• Multi-factor authentication (MFA): <br>• TOTP (Time-based One-Time Passcodes with Google Authenticator)<br>• Email one-time codes<br>• WebAuthN hardware keys |
| Authorization | • Role-based access control (RBAC)<br>• Groups and permissions management<br>• Fine-grained access policies |
| OAuth2 Support | • Multiple grant types (Authorization code, client credentials, etc)<br>• Token introspection and revocation<br>• PKCE for enhanced security<br>• JWT access tokens (RFC 9068) |
| OpenID Connect | • Standard OIDC configuration endpoints<br>• Discovery document<br>• JSON Web Key Sets (JWKS)<br>• Multiple response types |
| Developer Experience | • Browser-based admin UI<br>• Browsable REST API with HTML and JSON responses <br>• Signup and login views included


The server supports OAuth2 and OpenID Connect, with support for the following features and standards:

* Authorization code, client credentials, password and implicit grants.
* [OAuth2 discovery document][1] and OpenID Connect configuration endpoint.
* [OAuth 2 Token Introspection][2].
* [Proof Key for Code Exchange (PKCE)][3].
* [JSON Web Key Sets][4].
* [OAuth2 Token Revocation][5]
* [RFC 9068][7] - JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens.
* [OAuth 2.0 Multiple Response Type Encoding Practices](https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html)


📂 Documentation
-------------
- 🚀 [Getting started](/docs/getting-started.md)
- 🛠️ [Configure the server](/docs/server-settings.md)
- 🔗 [Integrate with a browser client](/docs/integration.md)
- 🔍 [Manage users with our APIs](/docs/user-api.md)
- 📝 [Contribution Guidelines](/.github/CONTRIBUTING.md)
- 📰 [Code of Conduct](/.github/CODE_OF_CONDUCT.md)


[1]: https://tools.ietf.org/html/rfc8414 "OAuth 2.0 Authorization Server Metadata"
[2]: https://tools.ietf.org/html/rfc7662 "OAuth 2 Token Introspection"
[3]: https://tools.ietf.org/html/rfc7636 "Proof Key for Code Exchange by OAuth Public Clients"
[4]: https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets
[5]: https://datatracker.ietf.org/doc/html/rfc7009
[6]: https://datatracker.ietf.org/doc/html/rfc8959
[7]: https://www.rfc-editor.org/rfc/rfc9068 "JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens"
