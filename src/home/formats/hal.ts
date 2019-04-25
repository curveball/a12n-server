export default (version: string) => ({

  _links: {
    'self': { href: '/', title: 'Auth API Home' },
    'sa:authorize' : { href: '/authorize', title: 'OAuth2 authorize endpoint', type: 'text/html' },
    'sa:logout': { href: '/logout', title: 'Expire tokens and sessions' },
    'sa:registration': { href: '/registration', title: 'Create a new user account' },
    'sa:token': { href: '/token', title: 'OAuth2 protocol endpoint' },
    'sa:validate-bearer': { href: '/validate-bearer', title: 'Validate a OAuth2 bearer token'},
    'sa:validate-totp': { href: '/validate-totp', title: 'Validate a TOTP 2FA token + bearer token'},
    'sa:user-collection': { href: '/user', title: 'List of users'},
    'oauth_server_metadata_uri' : { href: '/.well-known/oauth-authorization-server', title: 'OAuth 2.0 Authorization Server Metadata' }
  },
  version: version,

});
