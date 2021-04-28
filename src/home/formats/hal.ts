import { HalResource } from 'hal-types';
import { getSetting } from '../../server-settings';
import { User } from '../../principal/types';

export default (version: string, authenticatedUser: User, isAdmin: boolean) => {

  const result: HalResource = {
    _links: {
      'self': { href: '/', title: 'Home' },
      'authenticated-as': { href: '/user/' + authenticatedUser.id, title: authenticatedUser.nickname },
      'authorize' : { href: '/authorize', title: 'OAuth2 authorize endpoint', type: 'text/html' },
      'change-password': { href: '/changepassword', title: 'Change password' },
      'introspect' : {
        href: '/introspect',
        title: 'OAuth2 Introspection Endpoint',
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
        title: 'OAuth2 Token Endpoint',
        hints: {
          allow: ['POST'],
        }
      },
      'privilege-collection': {
        href: '/privilege',
        title: 'List of available privileges',
      },
      'app-collection': { href: '/app', title: 'List of apps'},
      'user-collection': { href: '/user', title: 'List of users'},
      'group-collection': { href: '/group', title: 'List of groups'},

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

  if (isAdmin) {
    result._links['exchange-one-time-token'] = {
      href: '/exchange-one-time-token',
      title: 'Exchange a one-time token for a Access and Refresh token',
    };
  }

  return result;

};
