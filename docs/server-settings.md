Server Settings & Configuration
-------------------------------

The following table lists all configurable options for a12nserver. These can be changed in the `server_settings` table in your database.

The value for each field is stored as a JSON string. This means that in order to store ``'null'``, you need the literal string ``'null'``.  \
To store a string, it needs to be surrounded by double-quotes. For example, a legal value for the `smpt.emailFrom` field might be `"info@example.org"`.

Some of the following server settings are also enabled as environment variables for ease of local development.


| Name                      | Type | Default value | Description | Environment Variable
|:--------------------------|------|--------------:|-------------|----------------------:|
| `cors.allowOrigin`          | String | `null`          | List of allowed origins that may directly talk to the server. This should only ever be 1st party, trusted domains. By default CORS is not enabled. 
| `jwt.privateKey`            | String  | `null` | The RSA private key to sign JWT access tokens. Usually this value has the contents of a .pem file. If not set, JWT will be disabled | `JWT_PRIVATE_KEY`
| `login.defaultRedirect`     | String  | `/`         | The url that the user will be redirected to after the log in to a12nserver, and no other redirect_uri is provided by the application. It's a good idea to set this to your application URL.
| `logo_url`                  | String  | `null` | The application logo to display on the a12nserver pages. If no logo url is provided, the application will show the Curveball logo by default. |
| `oauth2.code.expiry`        | Integer | `600` | The expiry time (in seconds) for the \'code\' from the oauth2 authorization code grant type | `OAUTH2_CODE_EXPIRY`
| `oauth2.accessToken.expiry` | Integer | `600` | The expiry time (in seconds) for OAuth2 access token. | `OAUTH2_ACCESSTOKEN_EXPIRY`
| `oauth2.refreshToken.expiry`| Integer | `3600 * 6` | The expiry time (in seconds) for OAuth2 refresh tokens. | `OAUTH2_REFRESHTOKEN_EXPIRY`
| `registration.enabled`      | Boolean | `true`    | Allow users to register new accounts. By default new accounts will be disabled and have no permissions.| `REGISTRATION_ENABLED`
| `registration.mf.enabled`   | Boolean | `true` | Allow users to register new accounts. By default new accounts will be disabled and have no permissions.
| `smtp.url`                  | String  | `null`  | The url to the SMTP server. See the node-mailer documentation for possible values | `SMTP_URL`
| `smtp.emailFrom`            | String  | `null` | The "from" address that should be used for all outgoing emails | `SMTP_EMAIL_FROM`
| `totp`                      | String  | `enabled` | Whether TOTP is enabled. TOTP uses authenticator apps like Google Authenticator and Authy. This can be set to "enabled", "disabled", and "required"
| `totp.serviceName`          | String  | `a12n-server API` | The name of the application that should show up in authenticator apps
| `webauthn`                  | String  | `enabled` | Whether webauthn is "enabled", "disabled" or "required".'
| `webauthn.serviceName`      | String  | `a12n-server` | The service name that should appear in Webauthn dialogs.
| `webauthn.expectedOrigin`   | String  | `null` | The "origin" of this server. This must be set for webauthn to work
| `webauthn.relyingPartyId`   | String  | `null` | The origin of the application performing the login.