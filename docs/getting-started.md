Getting started
===============

To set up a new a12n-server from scratch, start by obtaining the following
prerequisites:

1. NodeJS (version 14 or higher) and `npm`.
2. `git`.
3. MySQL (For Mac: install via ).
    - For Mac: easy install Homebrew [MySQL package](https://formulae.brew.sh/formula/mysql)
      via [Homebrew](https://brew.sh/).
    - For Linux: `apt install mysql-server`
4. Optional: A working [Docker][1] installation. The server can also be run
   straight from the cli.

After all of these prerequisites are acquired, run:

```sh
git clone git@github.com:evert/a12n-server.git
cd a12n-server
npm install
```

If using Docker, finish off with:

```sh
make docker-build
```

MySQL setup
-----------

After you have MySQL up and running, create new empty database (/schema) & user for `a12n-server`. Replace 'your_password' with a proper user password of your creation.

```sh
mysql> CREATE DATABASE a12nserver;
mysql> CREATE USER 'a12nserver' IDENTIFIED BY 'your_password';
mysql> GRANT SELECT, INSERT, UPDATE, DELETE ON a12nserver.* TO 'a12nserver';
mysql> FLUSH PRIVILEGES;
```

The next step is to insert the MySQL schemas that are shipping with the git repository. In the a12n-server project's root, just run:

```sh
cat mysql-schema/*.sql | mysql -u a12nserver -p -h hostname a12nserver
```

Running the server
------------------

Docker:

```sh
export MYSQL_PASSWORD=your_password
export MYSQL_USER=a12nserver
export MYSQL_DATABASE=a12nserver
docker run -it --rm -p 127.0.0.1:8531:8531 --name a12n-server-01 a12n-server
```

If you are running a12nserver outside of docker, the easiest way to change environment variables is to create a `.env` file in the a12n-server project root, and specify the following settings.

```sh
PORT=8531
MYSQL_HOST=127.0.0.1
MYSQL_PASSWORD=your_password
MYSQL_USER=a12nserver
MYSQL_DATABASE=a12nserver
PUBLIC_URI="http://localhost:8531/"
```

Note: There are several environment variables available to modify the a12n-server
behavior. See the table below.

|                           Name | Required? |               Default | Description                                                   |
|:------------------------------ |----------:|----------------------:|---------------------------------------------------------------|
| MYSQL_HOST                     |           |             127.0.0.1 | IP address to connect to where the `mysql-schema` was applied |
| MYSQL_USER                     |       Yes |                       | User to connect to MySQL with                                 |
| MYSQL_PASSWORD                 |       Yes |                       | Password to authenticate to MySQL                             |
| MYSQL_DATABASE                 |       Yes |                       | Database where the `mysql-schema` was applied                 |
| MYSQL_PORT                     |       No  |                  3306 | The port of MySQL                                             |
| MYSQL_INSTANCE_CONNECTION_NAME |           |                       |                                                               |
| PUBLIC_URI                     |           | http://localhost:8531 |                                                               |
| PORT                           |           |                  8531 | Port to host the API on.                                      |
| SMTP_URL                       |           |                       | See below section, [Email](#Email)                      |
| SMTP_EMAIL_FROM                |           |                       | See below section, [Email](#Email)                      |
| REDIS_HOST                     |           |                       | When specified, use Redis as a session storage. Required for running the server on multiple hosts.
| REDIS_PORT                     |           |                  6379 | Set tcp port for Redis
| JWT_PRIVATE_KEY                | No        |                       | When set, a12nserver will generate JWT OAuth2 Access tokens as specified in [draft-ietf-oauth-access-token-jwt][oauth2-jwt]. If this is not set, opaque strings will be used |

To start the server, we use `make`. Simply execute

```sh
make start
```

Creating the first user
-----------------------

After installation, you can open the server via `https://localhost:8531/`,
which will prompt you to create your first admin user.

Email
-----

To use any email related feature, such as 'reset password', the following environment variables are also required.

```sh
export SMTP_URL="smtps://[username]:[password]@[host]:[port]/"
export SMTP_EMAIL_FROM='"[Name]" <[Username]@example.org>'
```
The SMTP_URL takes any format that that [Nodemailer](https://nodemailer.com/smtp/) takes.


[oauth2-jwt]: https://tools.ietf.org/html/draft-ietf-oauth-access-token-jwt-12


Server Settings & Defaults
--------------------------

| Name                      | Type | Default value | Description |
|:--------------------------|------|--------------:|-------------|
| cors.allowOrigin          | Integer | NULL          | List of allowed origins that may directly talk to the server. This should only ever be 1st party, trusted domains. By default CORS is not enabled     
| jwt.privateKey            | String  | NULL | The RSA private key to sign JWT access tokens. Usually this value has the contents of a .pem file. If not set, JWT will be disabled
| login.defaultRedirect     | String  | `/`         | The url that the user will be redirected to after the log in to a12nserver, and no other redirect_uri is provided by the application. It's a good idea to set this to your application URL. 
| logo_url                  | String  | NULL | The application logo to display on the a12nserver pages. If no logo url is provided, the application will show the Curveball logo by default. |
| oauth2.code.expiry        | Integer | 600 (10 minutes) | The expiry time (in seconds) for the \'code\' from the oauth2 authorization code grant type |
| oauth2.accessToken.expiry | Integer | 600 (10 minutes) | The expiry time (in seconds) for OAuth2 access token. |
| oauth2.refreshToken.expiry| Integer | 3600 * 6 (6 hours) | The expiry time (in seconds) for OAuth2 refresh tokens. |
| registration.enabled      | Boolean | true    | Allow users to register new accounts. By default new accounts will be disabled and have no permissions.|
| registration.mf.enabled   | Boolean | true | Allow users to register new accounts. By default new accounts will be disabled and have no permissions.
| smtp.url                  | String  | NULL  | The url to the SMTP server. See the node-mailer documentation for possible values
| smtp.emailFrom            | String  | NULL | The "from" address that should be used for all outgoing emails
| totp                      | String  | enabled | Whether TOTP is enabled. TOTP uses authenticator apps like Google Authenticator and Authy. This can be set to "enabled", "disabled", and "required"
| totp.serviceName          | String  | `a12n-server API` | The name of the application that should show up in authenticator apps
| webauthn                  | String  | enabled | Whether webauthn is "enabled", "disabled" or "required".'
| webauthn.serviceName      | String  | `a12n-server` | The service name that should appear in Webauthn dialogs.
| webauthn.expectedOrigin   | String  | NULL | The "origin" of this server. This must be set for webauthn to work
| webauthn.relyingPartyId   | String  | NULL | The origin of the application performing the login.