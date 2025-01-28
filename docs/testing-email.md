Testing email on dev machines
=============================

a12n-server uses email for a few different purposes, such as:

* Lost password email flows.
* One-time-passwords for two-factor authentication.
* Email verification for new accounts.

To test email on your local machine, you can use a tool like [Mailhog][1] or
[Mailcatcher][2]. These tools run a fake SMTP server on your machine, and
have a small web frontend to see emails come through.


Both tools are pretty similar, so my recommendation is to use the one that
has a package for your operating system / package management tool of choice.

Mailhog will run a SMTP server on port 1025, and a web frontend on port 8025.
To configure a12n-server to use it, open your `.env` (or other place where
you edit environment variables) and set the following:

```bash
SMTP_URL=smtp://localhost:1025
# Email address that should be used as the FROM address
SMTP_EMAIL_FROM=Your friendly neighbourhood SysOp <no-reply@example.org>
```

After a12n-server restarts, it will start sending emails there and you
should be able to see them when opening your browser to `http://localhost:8025`.

[1]: https://github.com/mailhog/MailHog
[2]: https://mailcatcher.me/
