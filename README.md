`@curveball/a12n-server`: A simple authentication server
==================

*a12n* is short for "authentication".

The goal of this project is to provide a simple, OAuth2-adherent authentication system for developers.

![a12n-server home screenshot](https://raw.githubusercontent.com/curveball/a12n-server/master/docs/screenshot-0.27.png)

<details> 
  <summary> Why Oauth2? </summary>
  
  The other common web based authentication systems include:
  - Basic authentication over HTTP with (username and password)
  - Token-based authentication (with JSON web token) 
  - Cookie-based authentication
  - Session-based authentication
  
  Instead of building using a platform as a service like Auth0, which costs money 💸 , you can use this server on a self-hosted solution!
  
  OAuth2 is a widely used standard protocol for authentication and identity management in web applications.
  
</details>

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

Then, just open [http://localhost:8531/](http://localhost:8531/) to create
your admin account

🍭 Features
-------

This project has been used in production since 2018 and is still actively 
developed and maintained. `a12n-server` is part of a series of `@curveball` packages based on modern HTTP standards.

Instead of rolling your own authentication system, you get *A LOT* of features for free 🪄:

* Browsable API endpoints with:
  * errors and responses displayed in HTML and JSON 
  * [HAL](https://stateless.group/hal_specification.html)-formatted user resources.
* Admin UI with user permission and app management
* A flat permission model
* OAuth2 implementation
  * Supported grants: `implicit`, `client_credentials`, `authorization_code`
    and `password`.
  * [OAuth2 discovery document][1].
  * [PKCE][3].
  * [OAuth 2 Token Introspection][2].
  * [JSON Web Key Sets][4].
  * [OAuth2 Token Revocation][5]
  * [RFC 9068][7] - JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens.
  * [OAuth 2.0 Multiple Response Type Encoding Practices](https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html)
* MFA
  * Google Authenticator (grump turtle).
  * WebauthN (Passkeys) / Yubikeys
* Registration flow with one-time passcode (OTP)
* Forgot-my-password flow
* [`secret-token:` URI scheme][6]

📂 Documentation
-------------

- [🚀 Getting Started](/docs/getting-started.md)
- [🛠️ Configuration](/docs/server-settings.md)
- [📝 Contribution Guidelines](/.github/CONTRIBUTING.md)
- [📰 Code of Conduct](/.github/CODE_OF_CONDUCT.md)


[1]: https://tools.ietf.org/html/rfc8414 "OAuth 2.0 Authorization Server Metadata"
[2]: https://tools.ietf.org/html/rfc7662 "OAuth 2 Token Introspection"
[3]: https://tools.ietf.org/html/rfc7636 "Proof Key for Code Exchange by OAuth Public Clients"
[4]: https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets
[5]: https://datatracker.ietf.org/doc/html/rfc7009
[6]: https://datatracker.ietf.org/doc/html/rfc8959
[7]: https://www.rfc-editor.org/rfc/rfc9068 "JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens"