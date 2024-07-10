// Bring in more definitions
import '@curveball/session';

import { URLSearchParams } from 'url';

import { MemoryRequest, Context, MemoryResponse } from '@curveball/core';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import * as sinon from 'sinon';

import { InvalidRequest } from '../../../src/oauth2/errors.js';
import * as oauth2Service from '../../../src/oauth2/service.js';
import * as oauth2ClientService from '../../../src/oauth2-client/service.js';
import * as principalService from '../../../src/principal/service.js';
import * as userService from '../../../src/user/service.js';
import * as userAppPermissionService from '../../../src/user-app-permissions/service.js';
import * as serverSettings from '../../../src/server-settings.js';
import { User, App, OAuth2Client } from '../../../src/types.js';
import authorize from '../../../src/oauth2/controller/authorize.js';


chai.use(chaiAsPromised);
chai.use(sinonChai);

const expect = chai.expect;

describe('AuthorizeController', () => {
  const sandbox = sinon.createSandbox();

  const user: User = {
    id: 1,
    externalId: '1',
    href: '/user/1',
    identity: 'identity',
    nickname: 'nickname',
    createdAt: new Date(1),
    modifiedAt: new Date(1),
    type: 'user',
    active: true,
    system: false,
  };
  const app: App = {
    id: 1,
    externalId: '1',
    href: '/app/1',
    identity: 'identity',
    nickname: 'appname',
    createdAt: new Date(1),
    modifiedAt: new Date(1),
    type: 'app',
    active: true,
    system: false,
  };
  const oauth2Client: OAuth2Client = {
    id: 1,
    href: app.href + '/client/client-id',
    clientId: 'client-id',
    clientSecret: 'client-secret',
    app: app,
    allowedGrantTypes: ['authorization_code'],
    requirePkce: false,
  };


  let codeRedirectMock: sinon.SinonStub;

  beforeEach(function () {
    sandbox.stub(oauth2ClientService, 'findByClientId').returns(Promise.resolve(oauth2Client));
    sandbox.stub(oauth2Service, 'validateRedirectUri').returns(Promise.resolve(true));
    sandbox.stub(oauth2Service, 'requireRedirectUri').returns(Promise.resolve());
    codeRedirectMock = sandbox.stub(authorize, 'codeRedirect');
    sandbox.stub(principalService.PrincipalService.prototype, 'findByIdentity').returns(Promise.resolve(user));
    sandbox.stub(userService, 'validatePassword').returns(Promise.resolve(true));
    sandbox.stub(userService, 'hasTotp').returns(Promise.resolve(false));
    sandbox.stub(serverSettings, 'getSetting').returns(true);
    sandbox.stub(userAppPermissionService, 'setPermissions').returns(Promise.resolve(undefined));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('get', () => {
    let params: URLSearchParams;

    beforeEach(function () {
      params = new URLSearchParams({
        response_type: 'code',
        client_id: 'client-id',
        redirect_uri: 'redirect-uri',
        code_challenge: 'challenge-code',
        code_challenge_method: 'S256',
        state: 'state',
      });
    });

    it('should pass valid parameters and call code redirect', async() => {
      const request = new MemoryRequest('GET', '?' + params, 'http://localhost');
      const context = new Context(request, new MemoryResponse('http://localhost'));
      context.session = {
        user: {}
      };

      await authorize.get(context);
      expect(codeRedirectMock).to.have.been.calledWithExactly(
        context,
        oauth2Client,
        {
          responseType: 'code',
          clientId: 'client-id',
          redirectUri: 'redirect-uri',
          state: 'state',
          scope: [],
          codeChallenge: 'challenge-code',
          codeChallengeMethod: 'S256',
          display: undefined,
          nonce: undefined,
        }
      );
    });

    it('should set challenge code method to plain if not provided', async() => {
      params.delete('code_challenge_method');

      const request = new MemoryRequest('GET', '?' + params, 'http://localhost');
      const context = new Context(request, new MemoryResponse('http://localhost'));
      context.session = {
        user: {}
      };

      await authorize.get(context);
      expect(codeRedirectMock).to.have.been.calledWithExactly(
        context,
        oauth2Client,
        {
          responseType: 'code',
          clientId: 'client-id',
          redirectUri: 'redirect-uri',
          state: 'state',
          scope: [],
          codeChallenge: 'challenge-code',
          codeChallengeMethod: 'plain',
          display: undefined,
          nonce: undefined,
        }
      );
    });

    it('should pass valid parameters and call code redirect without PKCE', async() => {
      params.delete('code_challenge');
      params.delete('code_challenge_method');

      const request = new MemoryRequest('GET', '?' + params, 'http://localhost');
      const context = new Context(request, new MemoryResponse('http://localhost'));
      context.session = {
        user: {}
      };

      await authorize.get(context);
      expect(codeRedirectMock).to.have.been.calledWithExactly(
        context,
        oauth2Client,
        {
          responseType: 'code',
          clientId: 'client-id',
          redirectUri: 'redirect-uri',
          state: 'state',
          scope: [],
          codeChallenge: undefined,
          codeChallengeMethod: undefined,
          display: undefined,
          nonce: undefined,
        }
      );
    });

    it('should fail code challenge validation', async() => {
      params.set('code_challenge_method', 'bogus-method');

      const request = new MemoryRequest('GET', '?' + params, 'http://localhost');
      const context = new Context(request, new MemoryResponse('http://localhost'));
      context.session = {
        user: {}
      };

      await expect(authorize.get(context)).to.be.rejectedWith(InvalidRequest, 'The "code_challenge_method" must be "plain" or "S256"');
    });

    it('should fail when code method is provided but not challenge', async() => {
      params.delete('code_challenge');

      const request = new MemoryRequest('GET', '?' + params, 'http://localhost');
      const context = new Context(request, new MemoryResponse('http://localhost'));
      context.session = {
        user: {}
      };

      await expect(authorize.get(context)).to.be.rejectedWith(InvalidRequest, 'The "code_challenge" must be provided');
    });
  });
});
