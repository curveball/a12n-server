Managing users with the API
===========================

Most a12n-server features can be programmatically controlled with the REST
API. In fact, almost every endpoint in the admin interface can also be
accessed using a standard API client to get the JSON representation back.

Authentication
--------------

To authenticate with the API, you need to have an OAuth2 access token. You
can obtain one through any of the supported OAuth2 flows, for an example
check out the [integration](integration.md) guide.

To quickly obtain a token for testing purposes, you can also head over to
your user resource in the admin inteface, and click the `access-token` link.

If the server is running on `http://localhost:8531`, you can get there
quickly by going to `http://localhost:8531/me`

Once you have the token, include in the `Authorization` header in every
request:

```
Authorization: Bearer <token>
```

Available operations
--------------------

### Fetching a single user

* Method: `GET`
* Endpoint: `/user/:id`

This will return a single user resource. The response will be in the HAL format.

Response:

```json
{
  "_links": {
    "self": {
      "href": "/user/7DxQpHIrWCg",
      "title": "Evert"
    },
    "me": [
      {
        "href": "mailto:evert@badgateway.net",
        "title": "Evert"
      }
    ],
    "auth-log": {
      "href": "/user/7DxQpHIrWCg/log",
      "title": "Authentication log",
      "type": "text/csv"
    },
    "up": {
      "href": "/user",
      "title": "List of users"
    },
    "group": [],
    "describedby": {
      "href": "https://curveballjs.org/schemas/a12nserver/user.json",
      "type": "application/schema+json"
    },
    "one-time-token": {
      "href": "/user/7DxQpHIrWCg/one-time-token",
      "title": "Generate a one-time login token.",
      "hints": {
        "allow": [
          "POST"
        ]
      }
    },
    "access-token": {
      "href": "/user/7DxQpHIrWCg/access-token",
      "title": "Generate an access token for this user.",
      "hints": {
        "allow": [
          "POST"
        ]
      }
    },
    "identity-collection": {
      "href": "/user/7DxQpHIrWCg/identity",
      "title": "List of identities the user is associated with"
    },
    "auth-factor-collection": {
      "href": "/user/7DxQpHIrWCg/auth-factor",
      "title": "List of authentication methods / authentication factors for a user"
    },
    "active-sessions": {
      "href": "/user/7DxQpHIrWCg/sessions",
      "title": "Active user sessions"
    },
    "app-permission-collection": {
      "href": "/user/7DxQpHIrWCg/app-permission",
      "title": "App Permissions"
    },
    "edit-form": {
      "href": "/user/7DxQpHIrWCg/edit",
      "title": "Edit Evert"
    },
    "privileges": {
      "href": "/user/7DxQpHIrWCg/edit/privileges",
      "title": "Change privilege policy"
    },
    "password": {
      "href": "/user/7DxQpHIrWCg/password",
      "title": "Change user's password",
      "hints": {
        "allow": [
          "PUT"
        ]
      }
    }
  },
  "nickname": "Evert",
  "active": true,
  "createdAt": "2023-03-29T17:26:55.359Z",
  "modifiedAt": "2023-03-29T17:26:55.359Z",
  "type": "user",
  "privileges": {
    "*": [
      "read-users",
      "admin",
      "sprout:admin",
      "sprout:beta"
    ]
  },
  "hasPassword": true
}
```

Note that the available information here is dependent on the privileges
the caller has. If you are not an admin, you might not see for example
whether the user has a password set or the list of privileges.

You can use the availability of certain links as an indicator that the
client has the appropriate privileges. For example, the 'password' link
will not appear if the authenticated user is not allowed to change the
password of the user. This pattern lets you hide certain UI elements
when appropriate. This is a more robust way of handling permissions than
trying to interpret the list of privileges manually, as the server might
make certain features available based on other business logic than just
the privilege system.

### Getting a list of users.

* Method: `GET`
* Endpoint: `/user`

This will return a list of all users in the system. The response will be
in the HAL format. By default it will only include a list of links
pointing to each user in the collection:


```json
{
  "_links": {
    "self": {
      "href": "/user"
    },
    "item": [
      {
        "href": "/user/7DxQpHIrWCg",
        "title": "Evert"
      },
      {
        "href": "/user/HDQum0LcWuo",
        "title": "Jen"
      }
  }
}
```

To get more information about a user, you can follow the `item` link and
do a GET request there directly.

If you want to get the full response body for every user in the list, you
can either include the `?embed=item` query parameter, or include the
following HTTP header:

```
Prefer: transclude=item
```

Doing so will result in JSON response with each user resource embedded:

```json
{
  "_links": {
    "self": {
      "href": "/user"
    },
    "item": [
      {
        "href": "/user/7DxQpHIrWCg",
        "title": "Evert"
      },
      {
        "href": "/user/HDQum0LcWuo",
        "title": "Jen"
      }
    ]
  },
  "total": 2,
  "_embedded": {
    "item": [
      {
        "_links": {
          "self": {
            "href": "/user/7DxQpHIrWCg",
            "title": "Evert"
          },
          "me": [
            {
              "href": "mailto:evert@badgateway.net",
              "title": "Evert"
            }
          ],
          "auth-log": {
            "href": "/user/7DxQpHIrWCg/log",
            "title": "Authentication log",
            "type": "text/csv"
          },
          "up": {
            "href": "/user",
            "title": "List of users"
          },
          "group": [],
          "describedby": {
            "href": "https://curveballjs.org/schemas/a12nserver/user.json",
            "type": "application/schema+json"
          },
          "one-time-token": {
            "href": "/user/7DxQpHIrWCg/one-time-token",
            "title": "Generate a one-time login token.",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          },
          "access-token": {
            "href": "/user/7DxQpHIrWCg/access-token",
            "title": "Generate an access token for this user.",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          },
          "identity-collection": {
            "href": "/user/7DxQpHIrWCg/identity",
            "title": "List of identities the user is associated with"
          },
          "auth-factor-collection": {
            "href": "/user/7DxQpHIrWCg/auth-factor",
            "title": "List of authentication methods / authentication factors for a user"
          },
          "active-sessions": {
            "href": "/user/7DxQpHIrWCg/sessions",
            "title": "Active user sessions"
          },
          "app-permission-collection": {
            "href": "/user/7DxQpHIrWCg/app-permission",
            "title": "App Permissions"
          },
          "edit-form": {
            "href": "/user/7DxQpHIrWCg/edit",
            "title": "Edit Evert"
          },
          "privileges": {
            "href": "/user/7DxQpHIrWCg/edit/privileges",
            "title": "Change privilege policy"
          },
          "password": {
            "href": "/user/7DxQpHIrWCg/password",
            "title": "Change user's password",
            "hints": {
              "allow": [
                "PUT"
              ]
            }
          }
        },
        "nickname": "Evert",
        "active": true,
        "createdAt": "2023-03-29T17:26:55.359Z",
        "modifiedAt": "2023-03-29T17:26:55.359Z",
        "type": "user",
        "privileges": {
          "*": [
            "read-users",
            "admin",
            "sprout:admin",
            "sprout:beta"
          ]
        },
        "hasPassword": true
      },
      {
        "_links": {
          "self": {
            "href": "/user/HDQum0LcWuo",
            "title": "Jen"
          },
          "me": [
            {
              "href": "mailto:phil@badgateway.net",
              "title": "Jen"
            }
          ],
          "auth-log": {
            "href": "/user/HDQum0LcWuo/log",
            "title": "Authentication log",
            "type": "text/csv"
          },
          "up": {
            "href": "/user",
            "title": "List of users"
          },
          "group": [],
          "describedby": {
            "href": "https://curveballjs.org/schemas/a12nserver/user.json",
            "type": "application/schema+json"
          },
          "one-time-token": {
            "href": "/user/HDQum0LcWuo/one-time-token",
            "title": "Generate a one-time login token.",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          },
          "access-token": {
            "href": "/user/HDQum0LcWuo/access-token",
            "title": "Generate an access token for this user.",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          },
          "identity-collection": {
            "href": "/user/HDQum0LcWuo/identity",
            "title": "List of identities the user is associated with"
          },
          "auth-factor-collection": {
            "href": "/user/HDQum0LcWuo/auth-factor",
            "title": "List of authentication methods / authentication factors for a user"
          },
          "active-sessions": {
            "href": "/user/HDQum0LcWuo/sessions",
            "title": "Active user sessions"
          },
          "app-permission-collection": {
            "href": "/user/HDQum0LcWuo/app-permission",
            "title": "App Permissions"
          },
          "edit-form": {
            "href": "/user/HDQum0LcWuo/edit",
            "title": "Edit Jen"
          },
          "privileges": {
            "href": "/user/HDQum0LcWuo/edit/privileges",
            "title": "Change privilege policy"
          },
          "password": {
            "href": "/user/HDQum0LcWuo/password",
            "title": "Change user's password",
            "hints": {
              "allow": [
                "PUT"
              ]
            }
          }
        },
        "nickname": "Jen",
        "active": true,
        "createdAt": "2023-03-29T18:02:51.187Z",
        "modifiedAt": "2023-10-03T20:51:58.012Z",
        "type": "user",
        "privileges": {
          "*": [
            "read-users"
          ]
        },
        "hasPassword": false
      }
    ]
  }
}
```

### Creating a new user

* Method: `POST`
* Endpoint: `/user`

To create a new user, send a POST request to the `/user` endpoint. The
request body should be a JSON object looking like this:

```json
{
  "_links": {
    "me": { href": "mailto:kian@example.org" }
  },
  "nickname": "Kian",
  "type": "user"
}
```

This will create a new user with the nickname `Kian`. The response will
be an empty HTTP response body, with a `201 Created` status code and a
`Location:` header pointing to the newly created user resource.

### Updating a user

* Method: `POST`
* Endpoint: `/user/:id`

To update a user, send a `PUT` request to the user resource. The request
should should look like this:

```json
{
  "nickname": "Kian",
  "type": "user",
  "active": true
}
```

A successful request will result in a `204 No Content` response with no
response body.

### Other operations

Users link to a number of sub-resources that are used for a variety of
operations. Each endpoint can be discovered in a browser, where you can
see what it returns and in many cases availabile operations.

For example:

* `/user/:id/identity` - List of identities (such as email and phone numbers).
* `/user/:id/log` - User audit log
* `/user/:id/password` - Change the user password with a PUT request.
* `/user/:id/access-token` - Generate a developer token.
* `/user/:id/app-permission` - List of apps the user has granted permission to.
* `/user/:id/auth-factor` - List of authentication methods the user has enabled.
