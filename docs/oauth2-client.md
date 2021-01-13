Oauth2 client setup
===================

Setting up auth
---------------

To get the API up and running, you first need to have [a12n-server][1] installed.
Installation instructions can be found [here][2].

After a12nserver is running, and you confirmed you can log in, you need to
create separate new user & database. (Follow [a12n-server][1] installation for
 `MySQL setup` section)

 ```sh
mysql> CREATE DATABASE my-app-db;
mysql> CREATE USER 'my-app' IDENTIFIED BY 'your_password';
mysql> GRANT SELECT, INSERT, UPDATE, DELETE ON my-app-db.* TO 'my-app';
mysql> FLUSH PRIVILEGES;
```

After  you'll need to
add an 'app' and oauth2 credentials.

This is currently mostly a manual process.

Start by going to your 'create user' endpoint: `http://localhost:8531/create-user`

Through this interface, you'll make an 'app':

```
Nickname: my-app-api
Identity: https://api.my-app.com/
User Type: app
```
The next step is to insert the MySQL schemas that are shipping with the project
repository. The easiest is to just run:

```sh
cat mysql-schema/*.sql | mysql -u my-app -p -h hostname my-app-db
```

After this, it needs records set up in relevant database tables:

* `oauth2_clients`
* `oauth2_redirect_uris`

Note that the 'client_secret' is a bcrypt2 hash. It's possible to set these
records up via the interface on `http://localhost:8531/`, but the interface
is a little clunky.

The `my-app-api` user needs the following values:

* allowed_grant_types: `client_credentials refresh_token authorization_code`
* client_id should be `my-app-api`
* client_secret a bcrypt hash
* redirect_uri should include `http://localhost:8801/_browser-auth`

After this, is add the new api secret in `.env` file.
* OAUTH2_CLIENT_SECRET='password'

Running the api
---------------

From the `api` directory:

    make start

Deploying changes
------------------

Deploying a new build requires docker and the aws cli tools.
Once your AWS cli is setup with the credentials of the AWS account, you should be able to run:

     $(aws ecr get-login --no-include-email)

To log into the docker repo. Those credentials stay active for 24 hours. After this, you can run:

     make deploy

To push changes to production.

[1]: https://github.com/curveball/a12n-server/
[2]: https://github.com/curveball/a12n-server/blob/master/docs/getting-started.md
