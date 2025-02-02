import { getSetting } from '../../server-settings.js';
import { App, User, ServerStats } from '../../types.js';

function statsBlock(kind: string, count: number): string {

  return `
<div class="statsBlock">

  <div class="counter">
    <span class="num">${humanNum(count)}</span>
    <span class="kind">${kind}${count!=1?'s':''}</span>
  </div>

  ${kind!=='token' ? `<div class="actions"><a href="/${kind}" rel="${kind}-collection">Manage</a></div>`: ''}

</div>
`;

}

function humanNum(i: number): string {

  switch(true) {
    case i >= 10_000_000 :
      return (i / 1_000_000).toFixed(0) + 'M';
    case i >= 1_000_000 :
      return (i / 1_000_000).toFixed(1) + 'M';
    case i >= 1_0000 :
      return (i / 1_000).toFixed(0) + 'K';
    case i >= 1_000:
      return (i / 1_000).toFixed(1) + 'K';
    default :
      return i.toString();
  }

}

export default (version: string, authenticatedUser: User | App, isAdmin: boolean, serverStats: ServerStats) => {

  return `
<div class="statsTray">
  ${statsBlock('user', serverStats.user)}
  ${statsBlock('app', serverStats.app)}
  ${statsBlock('group', serverStats.group)}
  ${statsBlock('token', serverStats.tokensIssued)}
  ${statsBlock('privilege', serverStats.privileges)}
</div>

Useful links
------------

${getSetting('registration.enabled')?'* <a href="/register" rel="registration">Public registration</a>':''}
* <a href="/change-password" rel="change-password">Change Password</a>


<h2 class="oauth2">OAuth2 endpoints</h2>

* <a href="/authorize" rel="authorize">Authorization endpoint</a>
* <a href="/introspect" rel="introspection">Introspection endpoint</a> ([RFC7662][RFC7662])
* <a href="/token" rel="token">Token endpoint</a>
* <a href="/.well-known/oauth-authorization-server" rel="oauth_server_metadata_uri">Authorization Server Metadata</a> ([RFC8414][RFC8414])
* <a href="/.well-known/jwks.json" rel="jwks">JSON Web Key Sets</a> ([RFC7517][RFC7517])
* <a href="/authorization-challenge" rel="OAuth 2.0 for First-Party Applications">Authorization Challenge Endpoint</a> ([draft][draft-ietf-oauth-first-party-apps]) <span class="link-badge status-experimental">Experimental</span>

<h2 class="oidc">OpenID Connect endpoints</h2>

* <a href="/.well-known/openid-configuration" rel="openid-configuration">OpenID Configuration</a>
* <a href="/userinfo" rel="openid-userinfo">UserInfo endpoint</a>


Other API endpoints
-------------------

  ${isAdmin?`* <a href="/settings" rel="settings">Server settings</a>
* <a href="/exchange-one-time-token" rel="exchange-one-time-token">Exchange one-time-token</a>
* <a href="/schema" rel="schema-collection">JSON Schema collection</a>
`:''}

_Version ${version}_

[RFC7662]: https://tools.ietf.org/html/rfc7662 "OAuth 2.0 Token Introspection"
[RFC8414]: https://tools.ietf.org/html/rfc8414 "OAuth 2.0 Authorization Server Metadata"
[RFC7517]: https://tools.ietf.org/html/rfc7517 "JSON Web Key (JWK)"
[draft-ietf-oauth-first-party-apps]: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-first-party-apps "OAuth 2.0 for First-Party Applications"
`;

};
