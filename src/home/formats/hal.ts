export default (version: string) => ({

  _links: {
    'self': { href: '/', title: 'Auth API Home' },
    'sa:authorize' : { href: '/authorize', title: 'OAuth2 authorize endpoint', type: 'text/html' },
    'sa:token': { href: '/token', title: 'OAuth2 protocol endpoint' },
    'sa:bearer-info': { href: '/validate-bearer', title: 'Validate a OAuth2 bearer token'},
    'sa:validate-totp': { href: '/validate-totp', title: 'Validate a TOTP 2FA token + bearer token'},
    'sa:user-collection': { href: '/user', title: 'List of users'},
  },
  version: version,

});
