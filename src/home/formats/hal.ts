import { HalResource } from 'hal-types';
import { getSetting } from '../../server-settings';
import { User } from '../../user/types';

export default (version: string, authenticatedUser: User) => {

  const result: HalResource = {
    _links: {
      'self': { href: '/', title: 'Auth API Home' },
      'authenticated-as': { href: '/user/' + authenticatedUser.id, title: authenticatedUser.nickname },
      'authorize' : { href: '/authorize', title: 'OAuth2 authorize endpoint', type: 'text/html' },
      'change-password': { href: '/changepassword', title: 'Change user\'s password' },
      'introspect' : {
        href: '/introspect',
        title: 'OAuth2 Token Introspection',
        hints: {
          allow: ['POST'],
        }
      },
      'logout': {
        href: '/logout',
        title: 'Log out',
      },
      'token': {
        href: '/token',
        title: 'OAuth2 protocol endpoint',
        hints: {
          allow: ['POST'],
        }
      },
      'privilege-collection': {
        href: '/privilege',
        title: 'List of available privileges',
      },
      'user-collection': { href: '/user', title: 'List of users'},

      'oauth_server_metadata_uri' : {
        href: '/.well-known/oauth-authorization-server',
        title: 'OAuth 2.0 Authorization Server Metadata'
      }
    },
    version: version,
  };

  if (getSetting('registration.enabled')) {
    result._links.registration = {
      href: '/register',
      title: 'Create a new user account',
      type: 'text/html'
    };
  }

  return result;

};
