Contributing guidelines
=======================

Thanks for considering contribution to this project! 


🚀 Getting Started
-------------------------------

Pre-requisites:
- `node` <= 18 and `npm` 
- `mysql`, `sqlite` or `postgres`

[Run from source](../docs/getting-started.md#running-from-source-locally)

[Run the codebase with Docker](../docs/getting-started.md#running-with-docker-compose)

For more, see [Getting Started](../docs/getting-started.md) for standard instructions.

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
| [Knex](https://knexjs.org/) | Database migrations and query building |
| [Handlebars](https://handlebarsjs.com/) | Lightweight view templating |
| [ESLint](https://eslint.org/) | Linting |
| [jose](https://github.com/panva/jose) | JSON Object encryption and signing |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Password hashing |
| [nodemailer](https://nodemailer.com/about/) | Email dispatch |


👀 Whats Inside
---------------
Everything prepended with `_` is either a hidden file or a build artifact.

```sh 
.github                   CI workflows
├── .gitignore
├── .env.defaults         default environment variables
├── Dockerfile
├── LICENSE
├── Makefile              The most comprehensive source of truth for build commands
├── README.md
├── assets                static files for running in browser (css, js)
├── bin                   scripts for generating JSON schemas and running db migrations
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

Ways to Contribute
----------------

### Pick an issue 🏷️

Check out the tagged [Issues list](https://github.com/evert/a12n-server/issues) and [labels](https://github.com/evert/a12n-server/labels). 

The issues require different skill levels, so for your first issue, pick something you're comfortable with.

### Contribute an integration for your favorite framework

This project could use sandboxes and examples of integrating a12n-server with different front end frameworks!

Check out a12n-server x Next.js: [`@curveball/next-a12n`](https://github.com/curveball/next-a12n)

See [Integration with a browser client](/docs/integration.md) for context on basic usage.

👩‍💻 Development Resources
------------------------

🚀 [Getting started](/docs/getting-started.md)

🛠️ [Configure the server](/docs/server-settings.md)

🔍 [Manage users with our APIs](/docs/user-api.md)

✉️  [Testing email](/docs/testing-email.md)
