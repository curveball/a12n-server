Authentication API
==================

This package aims to provide a simple authentication system. The goal is to
provide something good enough for prototyping and in-house deployments.

The idea behind this came from the fact that I found myself building
authentication systems over and over again for new jobs and customers, but I
had trouble finding a solution that struck the right balance between
simplicity and the features I needed.

So, the last time I had to build this I decided I would make a simple generic
system and open source it, so hopefully I can re-use this for the _next_
time I need this.

Requirements
------------

* Node.js 8.x
* MySQL

Features
--------

* A simple browseable API.
* OAuth2
  * Supported grants: `implicit`, `client_credentials`, `authorization_code` and `password`.
  * [OAuth2 discovery document][1].
* Google Authenticator (TOTP).
* [OAuth 2 Token Introspection][2].
* A simple, flat, permission model.

The state of this project
-------------------------

If you are thinking of building a new authentication system, and decide to use
this project instead, you get a lot of features for free.

It's not yet in a state where it's "install-and-go", but the goal is to
eventually get there.

Here's a few key features that I'd imagine people might want, but hasn't been
built yet:

* A 'lost password' feature.
* A registration API (Both OAuth2 clients and users all need to be 100%
  managed by manually adding database records).
* A management interface. This project will be API-only, but a separate admin
  SPA would be sweet.
* OAuth2 scopes.
* Middlewares for other frameworks and languages that can validate Bearer
  tokens by calling this API.
* JWT. Maybe.
* Configuration to turn certain things off, like TOTP.
* Documentation and tutorials.

So currently, there's definitely still a lot to do. If you need any of the
above, ask. Chances are that I can find the time to priorize it so you can
start using it. Contributions are also very welcome.

But yea, I want to be clear. This project is used in production, but 'alpha'
quality if you're looking for something polished. It's actively developed.

My hope is that people will find this and decide that this project is a great
starting point _instead_ of building something 100% from scratch.

[1]: https://tools.ietf.org/html/rfc8414 "OAuth 2.0 Authorization Server Metadata"
[2]: https://tools.ietf.org/html/rfc7662 "OAuth 2 Token Introspection"
