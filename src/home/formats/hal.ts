import { getSetting } from '../../server-settings';
import { HalResource } from 'hal-types';

export default (version: string) => {

  const result: HalResource = {
    _links: {
      'self': { href: '/', title: 'Auth API Home' },
      'authorize' : { href: '/authorize', title: 'OAuth2 authorize endpoint', type: 'text/html' },
      /*
      'introspect' : {
        href: '/introspect',
        title: 'OAuth2 Token Introspection',
        hints: {
          allow: ['POST'],
        }
      },
       */
      'logout': {
        href: '/logout',
        title: 'Expire tokens and sessions'
      },
      'token': {
        href: '/token',
        title: 'OAuth2 protocol endpoint'
      },
      'validate-bearer': { href: '/validate-bearer', title: 'Validate a OAuth2 bearer token'},
      'validate-totp': { href: '/validate-totp', title: 'Validate a TOTP 2FA token + bearer token'},
      'user-collection': { href: '/user', title: 'List of users'},
      'oauth_server_metadata_uri' : { href: '/.well-known/oauth-authorization-server', title: 'OAuth 2.0 Authorization Server Metadata' }
    },
    version: version,
  };

  if (getSetting('registration.enabled')) {
    result._links['registration'] = {
      href: '/registration',
      title: 'Create a new user account',
      type: 'text/html'
    };
  }

  return result;

};
