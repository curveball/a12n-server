Getting started
===============

To set up this server in your development environment, the following must be
installed:

1. NodeJS (version 14 or higher) and `npm`.
2. `git`.
3. MySQL, PostgreSQL or SQLite. SQLite is not recommended for production.


If you are deploying in production, we recommend the
[official docker images][1].


Getting the development environment up and running
--------------------------------------------------

Get the source:

```sh
git clone git@github.com:curveball/a12n-server.git
cd a12n-server
npm install
```

Configuring the server
----------------------

Copy `.env.defaults` to `.env` and open the file up in your editor.

```sh
cp .env.defaults .env
```

In your editor, go through the file and configure it so it makes sense to you.

For the database, pick the section of your choice. If your database is setup
correctly and a12nserver has access to it, it will automatically connect to it
on start and build the database schema.

### MySQL setup

After you have MySQL up and running, create new empty database (/schema) & user for `a12n-server`. Replace 'your_password' with a proper user password of your creation.

```sh
mysql> CREATE DATABASE a12nserver;
mysql> CREATE USER 'a12nserver' IDENTIFIED BY 'your_password';
mysql> GRANT SELECT, INSERT, UPDATE, DELETE, ALTER, CREATE, DROP ON a12nserver.* TO 'a12nserver';
mysql> FLUSH PRIVILEGES;
```

### Postgres setup

TODO


### Sqlite setup

TODO


Running the server
------------------

After all that, all you have to do is run:

```sh
make start
```

If you are developing a12nserver, you might prefer `make start-dev` which
automatically restarts the server when you make a chance.


Creating the first user
-----------------------

After installation, you can open the server via `https://localhost:8531/`,
which will prompt you to create your first admin user.


[1]: https://github.com/curveball/a12n-server/pkgs/container/a12n-server%2Fa12nserver
