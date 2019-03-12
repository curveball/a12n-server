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


Creating the first user
-----------------------

Currently the server has no interface for creating users, or an installation
wizard. So after starting the server and opening it in a browser, you are
dropped in a log in screen but with no way to get in.

Creating users has to be done manually in MySQL. Example query:


```sql
INSERT INTO users SET

  /* Identity should always be a unique uri. For users this should probably
     just be a mailto: address, but any uri is OK. */
  identity = 'mailto:admin@example.org',

  /* A human-readable name for easy identification */
  nickname = 'Admin',

  /* Ceration date as a timestamp */
  created = UNIX_TIMESTAMP(),

  /* Set this to 0 to disable the account */
  active = 1,

  /* 1 = a human or person, 2 = an app or computer */
  type = 1;

SET @user_id = LAST_INSERT_ID();
```

Now comes the tricky part. To log a user in, they need 2 more bits of
information, that are a bit harder to obtain.

A password, which must be a bcrypt hash. For example, this is a bcrypt
hash for the password 'admin'. You can use this for testing purposes, but
you should really change it:

```sql
INSERT INTO user_passwords SET
  user_id = @user_id,
  password = '$2b$12$nTiFi54co3c.8A.hwBI8D.ehpJ221i/i58QKo53JhS/N1O2r/ga6C';
```

Lastly, a user needs a 2FA (TOTP) code. Enter the same code both in the
database as well as an app such as Authy or Google Auhtenticator:

```sql
INSERT INTO user_totp SET
  user_id = @user_id,
  secret = 'FNYECURZI4ZEMY2FKJVTC2KSNJMHCVCZ';
```

Sample code for generating these strings
----------------------------------------

Eventually the server will provide an API to create new users, an a simple
installation wizard to create the first.

Until then they need to be added manually. Sample code for generating a bcrypt
hash:

```javascript
const bcrypt = require('bcrypt');
const hash = bcrypt.hashPassword('my password', 12);
console.log(hash);
```

Sample code for generating a new 2FA code:

```javascript
const otplib = require('otplib');
const secret = otplib.authenticator.generateSecret();
console.log(secret);
```

[1]: https://www.docker.com/
