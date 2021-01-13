Getting started
===============

To set up a new a12n-server from scratch, start by obtaining the following
prerequisites:

1. NodeJS (version 14 or higher) and `npm`.
2. `git`.
3. Optional: A working [Docker][1] installation. The server can also be run
   straight from the cli.


After all of these steps are complete, run:

```sh
git clone git@github.com:evert/a12n-server.git
cd a12n-server
npm install
make docker-build
```

MySQL setup
-----------

After you have MySQL up and running, create new empty database (/schema) & user for
`a12n-server`.

```sh
mysql> CREATE DATABASE a12nserver;
mysql> CREATE USER 'a12nserver' IDENTIFIED BY 'your_password';
mysql> GRANT SELECT, INSERT, UPDATE, DELETE ON a12nserver.* TO 'a12nserver';
mysql> FLUSH PRIVILEGES;
```

The next step is to insert the MySQL schemas that are shipping with the git
repository. The easiest is to just run:

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

If you are running a12nserver outside of docker, the easiest way to change
environment variables is to create a `.env` file, and specify the following settings.

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
|-------------------------------:|----------:|----------------------:|---------------------------------------------------------------|
|                     MYSQL_HOST |           |             127.0.0.1 | IP address to connect to where the `mysql-schema` was applied |
|                     MYSQL_USER |       Yes |                       | User to connect to MySQL with                                 |
|                 MYSQL_PASSWORD |       Yes |                       | Password to authenticate to MySQL                             |
|                 MYSQL_DATABASE |       Yes |                       | Database where the `mysql-schema` was applied                 |
| MYSQL_INSTANCE_CONNECTION_NAME |           |                       |                                                               |
|                     PUBLIC_URI |           | http://localhost:8531 |                                                               |
|                           PORT |           |                  8531 | Port to host the API on.                                      |
|                       SMTP_URL |           |                       | See below section, [Email](#Email)                      |
|                SMTP_EMAIL_FROM |           |                       | See below section, [Email](#Email)                      |
|                     REDIS_HOST |           |                       | When specified, use Redis as a session storage. Required for running the server on multiple hosts.
|                     REDIS_PORT |           |                  6379 | Set tcp port for Redis


To start the server, we use `make`. Simply execute

```sh
make start
```

Creating the first user
-----------------------

After installation, you can open the server via `https://localhost:8531/`.
By default registration is enabled, and you can register your admin user
via the 'Register' link.

After registration log in will _not_ immediately work. Users needs to be
activated, and there's no automated facility yet to do this.

Instead, run the following query:

```sql
UPDATE users SET active = 1 WHERE id = 1;
```

To give your newly created user full admin privileges, run:

```sql
INSERT INTO user_privileges SET user_id = 1, privilege = 'admin', resource='*';
```

Email
-----

To use any email related feature, such as 'reset password', the following environment variables are also required.

```sh
export SMTP_URL="smtps://[username]:[password]@[host]:[port]/"
export SMTP_EMAIL_FROM='"[Name]" <[Username]@example.org>'
```
The SMTP_URL takes any format that that [Nodemailer](https://nodemailer.com/smtp/) takes.

Next steps
----------

[Oauth2 Client Setup](https://github.com/curveball/a12n-server/blob/master/docs/oauth2-client.md)

[1]: https://www.docker.com/
