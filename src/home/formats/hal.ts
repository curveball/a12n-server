export default (version: string) => ({

  _links: {
    'self': { href: '/', title: 'Auth API Home' },
    'sa:authenticate' : { href: '/authenticate', title: 'OAuth2 authentication endpoint', type: 'text/html' },
    'sa:token': { href: '/token', title: 'OAuth2 protocol endpoint' },
    'sa:bearer-info': { href: '/validate-bearer', title: 'Validate a OAuth2 bearer token'},
    'sa:validate-totp': { href: '/validate-totp', title: 'Validate a TOTP 2FA token + bearer token'},
    'sa:user-collection': { href: '/user', title: 'List of users'},
  },
  version: version,
  
});
