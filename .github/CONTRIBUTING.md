Contributing guidelines
=======================

Thanks for considering contribution to this project! 


🚀 Getting Started
-------------------------------

Pre-requisites:
- `node` <= 18 and `npm` 
- `mysql`, `sqlite` or `postgres`

See [Getting Started](./docs/getting-started.md) for standard instructions.

Instead of using Docker, run the server locally and connect to a local MySQL database.

1. Install all dependencies: `npm i`
2. Create a `.env` file by copying `.env.defaults` with `cp .env.default .env` and set the following in `.env`:

```sh
export MYSQL_HOST=127.0.0.1
export MYSQL_PASSWORD=.... # your password
export MYSQL_USER=root
export MYSQL_DATABASE=a12nserver
```
3. run `make` to start the server locally.


🧦 Linting
-------
`make fix` will run ESLint to fix style issues.

⚙️ Tools and Tech
----------------

This project dogfoods [`@curveball`](https://github.com/curveball) packages built from modern web and HTTP standards. 

A non-exhaustive overview of core tools:

| Tool | Rationale |
|------|-------------|
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Node.js](https://nodejs.org/) | Runtime |
| [Knex](https://knexjs.org/) | Database migrations |
| [Handlebars](https://handlebarsjs.com/) | Lightweight view templating |
| [ESLint](https://eslint.org/) | Linting |
| [jose](https://github.com/panva/jose) | JSON Object encryption and signing |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Password hashing |
| [nodemailer](https://nodemailer.com/about/) | Email dispatch |


👀 Whats Inside
---------------

```sh 
.
.gitignore
.env.defaults             default environment variables
├── Dockerfile
├── LICENSE
├── Makefile
├── README.md
├── assets                static files for running in browser (css, js)
├── bin                   scripts for generating JSON schemas and db migration
├── changelog.md
├── _dist                 built output of type definitions
├── docs
├── eslint.config.mjs
├── _node_modules
├── package-lock.json
├── package.json
├── schemas
├── src                   All source code including endpoint controllers and types
├── templates             HTML view templates created with Handlebars
├── test                  unit/integration tests
└── tsconfig.json
```

Pick an issue 🏷️
----------------

Check out the tagged [Issues list](https://github.com/evert/a12n-server/issues) and [labels](https://github.com/curveball/a12n-server/labels). 
The issues require different skill levels, so for your first issue, pick something you're comfortable with.