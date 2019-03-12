Getting started
===============

To set up a new a12n-server from scratch, start by obtaining the following
prequisites:

1. A working [Docker][1] installation.
2. A working `nodejs` and `npm` binary.
3. `git`.

After all of these steps are complete, run:

```sh
git clone git@github.com:evert/a12n-server.git
cd a12n-server
npm install
make docker-build
```

MySQL setup
-----------

After you have MySQL up and running, create a new empty database (/schema) for
`a12n-server`.

The next step is to insert the MySQL schemas that are shipping with the git
repository. The easiest is to just run:

```sh
cat mysql-schema/*.sql | mysql -u username -p -h hostname databasename 
```

Running the server
------------------

```sh
export MYSQL_HOST=127.0.0.1
export MYSQL_PASSWORD=....
export MYSQL_USER=root
export MYSQL_DATABASE=a12nserver
docker run -it --rm -p 8531:8531 --name a12n-server-01 a12n-server
```

[1]: https://www.docker.com/
