Authenticating with your browser client
=======================================

This guide is a short introduction in performing an OAuth2 authentication
flow from a browser. We'll be using the [authorization_code][1] grant type.

Normally we recommend that users use an OAuth2 client library, but for the
sake of this example we'll be using the `fetch` API.

This guide assumes you have a running a12n-server instance running on 
`http://localhost:8531` and that you are hosting the below demo code on
`http://localhost:3000`.

We will be making 2 distinct pages:

* `/login.html` - This page will contain a button that will redirect the user
  to the a12n-server's authorization endpoint.
* `/callback.html` - This page will be the redirect URI that the a12n-server
  will redirect the user to after they have authenticated.

Creating the OAuth2 client 
--------------------------

Assuming you have a running a12n-server instance on `http://localhost:8531`,
you can use this url to create a client with all the correct values pre-filled:

```
http://localhost:8531/app/new?nickname=oauth2-demo&allowedGrantTypes=authorization_code,refresh_token&redirectUris=http://localhost:3000/callback.html&url=http://localhost:3000&clientId=oauth2-demo
```

Or click [here](http://localhost:8531/app/new?nickname=oauth2-demo&allowedGrantTypes=authorization_code,refresh_token&redirectUris=http://localhost:3000/callback.html&url=http://localhost:3000&clientId=oauth2-demo)

Validate each step to make sure that it makes sense for you. If your URLs are
different, adjust those.


Creating login.html
--------------------

The following code will create a simple login page that will redirect the user
to the a12n-server's authorization endpoint after pressing the 'login' button.


```html
<!DOCTYPE html>
<html>
  <head>
    <title>OAuth2 Example</title>
  </head>
  <body>
    <button id="login">Login</button>
    <script>

      const redirectUri = 'http://localhost:3000/callback.html';
      const clientId = 'oauth2-demo'; 
      const authorizationEndpoint = 'http://localhost:8531/authorize';

      document.getElementById('login').addEventListener('click', async () => {

        // This is the first step in the OAuth2 flow. We redirect the user to the
        // authorization endpoint, which will prompt the user to login and authorize
        // the client.
        const parameters = new URLSearchParams({
          response_type: 'code',
          client_id: clientId,
          redirect_uri: redirectUri
        });
        window.location.href = authorizationEndpoint + parameters.toString();

      });
    </script>
  </body>
</html>
```

Creating callback.html
----------------------

The following code will create a simple callback page that will parse the
authorization code from the URL and exchange it for an access token.



```html
<!DOCTYPE html>
<html>
  <head>
    <title>OAuth2 Example</title>
  </head>
  <body>
    <h1>Callback</h1>
    <script>

      const redirectUri = 'http://localhost:3000/callback.html';
      const clientId = 'oauth2-demo';
      const tokenEndpoint = 'http://localhost:8531/token';

      const query = new URLSearchParams(window.location.search);
      if (query.has('code')) {
        const code = query.get('code');
        fetch(tokenEndpoint, {
          method: 'POST',
          body: new FormData({
            grant_type: 'authorization_code',
            code: code,
            client_id: clientId,
            redirect_uri: 'http://localhost:3000/callback.html'
          })
        })
        .then(response => response.json())
        .then(data => {
          console.log('Login successful! We have a set of credentials');
          console.log(data);
        });
      }
    </script>
  </body>
</html>
````

Improving security
------------------

This example is meant as a really simple introduction, but to increase security,
you should use a `state` parameter to prevent CSRF attacks. You should also
ideally use PKCE to prevent authorization code interception attacks.

OAuth2 clients typically ship with these security features built in, so we
recommend using a library for your OAuth2 client.

[1]: https://developer.okta.com/blog/2018/04/10/oauth-authorization-code-grant-type
