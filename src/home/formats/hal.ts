export default (version: string) => ({

  _links: {
    'self': { href: '/', title: 'Auth API Home' },
    'sa:token': { href: '/token', title: 'OAuth2 protocol endpoint' },
    'sa:validate-bearer': { href: '/validate-bearer', title: 'Validate a OAuth2 bearer token'},
    'sa:validate-totp': { href: '/validate-2fa', title: 'Validate a TOTP 2FA token + bearer token'},
    'sa:users': { href: '/users', title: 'List of users' },
  },
  version: version,
  
});
