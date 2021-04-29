import { User } from '../../principal/types';
import { getSetting } from '../../server-settings';
import { PrincipalStats } from '../../principal/types';

export default (version: string, authenticatedUser: User, isAdmin: boolean, userStats: PrincipalStats) => {

  return `
Curveball A12N Server
=====================

_Version ${version}_

${authenticatedUser.nickname}
---

* <a href="/user/${authenticatedUser.id}" rel="authenticated-as">My profile</a>
* <a href="/changepassword" rel="change-password">Change password</a>
* <a href="/logout" rel="logout">Log out</a>


Admin
-----

* <a href="/privilege" rel="privilege-collection">List of privileges</a>
* <a href="/user" rel="user-collection">List of users</a>
${getSetting('registration.enabled')?'* <a href="/register" rel="registration">Public registration endpoint</a>':''}
<table>
  <tbody>
    <tr>
      <th>Principals</th>
      <th>Total</th>
    </tr>
    <tr>
      <td>Users</td>
      <td>${userStats.user}</td>
    </tr>
    <tr>
      <td>Apps</td>
      <td>${userStats.app}</td>
    </tr>
    <tr>
      <td>Groups</td>
      <td>${userStats.group}</td>
    </tr>
  </tbody>
</table>


OAuth2 endpoints
----------------

* <a href="/authorize" rel="authorize">Authorization endpoint</a>
* <a href="/introspect" rel="introspection">Introspection endpoint</a> ([RFC7662][RFC7662])
* <a href="/token" rel="token">Token endpoint</a>
* <a href="/.well-known/oauth2-authorization-server" rel="oauth_server_metadata_uri">Authorization Server Metadata</a> ([RFC8414][RFC8414])

Other API endpoints
-------------------

* ${isAdmin?'<a href="/exchange-one-time-token" rel="exchange-one-time-token">Exchange one-time-token</a>':''}

[RFC7662]: https://tools.ietf.org/html/rfc7662 "OAuth 2.0 Token Introspection"
[RFC8414]: https://tools.ietf.org/html/rfc8414 "OAuth 2.0 Authorization Server Metadata"
`;

};


