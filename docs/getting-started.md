Getting started
===============

Contents:

- [Getting started](#getting-started)
  - [The dev server](#the-dev-server)
    - [What's next](#whats-next)
  - [Deploying in production](#deploying-in-production)
  - [Running from source locally](#running-from-source-locally)
  - [Running with docker-compose](#running-with-docker-compose)
    - [Setup](#setup)
    - [Commands](#commands)


The dev server
--------------

There are a few different ways to run a12n-server. We recommend new users start
with the `npx` script. This will automatically download the latest version of
the server, create a default configuration and a sqlite database.

To use this, simply create an empty directory and run: 

```sh
npx @curveball/a12n-server
```

This creates `a12nserver.sqlite`, and a `.env` file with settings. After that,
you can open <https://localhost:8531> in your browser to continue set up.

The `npx` command is provided by Node / NPM, so make sure those dependencies
are installed first.

### What's next

After running your dev server, you will probably want to integrate it with your
application. If so, read the [integration guide](./integration.md).

Deploying in production
-----------------------

In production we recommend using the official Docker image. This automatically
gets built for every release.

You should also use a regular database. Both MySQL and Postgres are supported.

A minimum configuration might look like this;

```sh
docker run \
  -e DB_DRIVER=postgresql \
  -e DB_HOST=host \
  -e DB_USER=user \
  -e DB_PASSWORD=password \
  -e DB_DATABASE=a12n \
  -p 8531:8531 \
  ghcr.io/curveball/a12n-server/a12nserver:0.29.0
```

You should also set a few more environment variables for all the features to work.

```
# Should be an RSA private key, and is require for JWT and OpenID Connect support.
JWT_PRIVATE_KEY= 

# Should be set to the domainname where this will be hosted. Required for absolute
# urls to be correct.
CURVEBALL_ORIGIN=https://auth.example.org/

# Should be set to point to an smtp server. Required for validation, otp,
# invitation and lost-password emails.
SMTP_URL=smtp://username:password@my-mail-server.org:1025
SMTP_EMAIL_FROM=Your friendly neighbourhood auth server <no-reply@example.org>

# Should point to a Redis server. Required if multiple load-balanced instances are running
REDIS_URI=redis://some-redis-serveR:6379
```

Running from source locally
--------------------------

If you are interested to run a12n-server from the github source, for making modifications
or running the latest development version, you can follow the instructions below.

First, do a git checkout of the source and install dependendencies:

```sh
git clone git@github.com:curveball/a12n-server.git
cd a12n-server
npm i
```

Next, the easiest way to get started is to copy the sample `.env` file, which is enough
to run the server on a sqlite database.

```sh
cp .env.defaults .env
```

Run your database of choice locally. If you don't pick one, the server will use sqlite.

After this, you can edit your `.env` for any changes you want to make and then run the
server with:

```sh
make start
```

Or to start the auto-restarting development server:

```sh
make start-dev
```

Running with docker-compose
----------------------

The `Dockerfile` and `docker-compose.yml` file at the root of the project work together to start the
development server with a postgres database.

Prerequisites:

- [Docker Desktop](https://docs.docker.com/desktop/) or CLI

### Setup
1. Ensure the variables match the values in the `docker-compose.yml` file.
1. Create a RSA JWT private key at the root of the project with `openssl genrsa -out ./jwt_secret.key 4096`.
It will be read by Docker as the `JWT_PRIVATE_KEY` environment variable.

### Commands

First time setup:
`docker compose up --build` will build the Docker image before starting the container

Thereafter:
`docker compose up` will start the server and the database containers. The server will be available at <https://localhost:8531>.

`docker compose ps` will list all active containers.

`docker compose down` will stop the server and the database.

`docker compose down --volumes` will stop the server && database, and also delete the volumes with data. This is useful if you want to start fresh.