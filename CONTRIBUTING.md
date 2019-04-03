Contributing guidelines
=======================

Getting a server up and running
-------------------------------

The standard instructions for getting a server up and running are [here](./docs/getting-started.md),
but to make it easier to do development, you might want to consider not running the server in Docker.

To do this, follow the instructions from the getting started guide for getting MySQL up and runnning
and creating your initial users, but skip the Docker installation.

Instead, you need to have a working `node` and `npm` executable, and run:

```sh
npm i
```

This will install all dependencies.
After that, set the correct environment variables and run `make` to start the server locally:

```sh
export MYSQL_HOST=127.0.0.1
export MYSQL_PASSWORD=....
export MYSQL_USER=root
export MYSQL_DATABASE=a12nserver
make
```

Picking an issue
----------------

If you're looking to contribute, the [Issues list](https://github.com/evert/a12n-server/issues) has tags
to help you find an issue. The issues require different skill levels, so for your first issue pick
something you are comfortable with.

Code quality
-------------

The source has a linter installed. It's very easy to run it and fix linting-related issues:

    make fix
    
In this stage of the project we don't require any (unit)tests, but they are welcomed.

