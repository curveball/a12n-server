// Bring in more definitions
import '@curveball/session';

import { URLSearchParams } from 'url';

import { MemoryRequest, Context, MemoryResponse } from '@curveball/core';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';

import { InvalidRequest } from '../../../src/oauth2/errors';
import * as oauth2Service from '../../../src/oauth2/service';
import * as oauth2ClientService from '../../../src/oauth2-client/service';
import * as principalService from '../../../src/principal/service';
import * as userService from '../../../src/user/service';
import * as serverSettings from '../../../src/server-settings';
import { User, App } from '../../../src/principal/types';
import { OAuth2Client } from '../../../src/oauth2-client/types';
import authorize from '../../../src/oauth2/controller/authorize';

chai.use(chaiAsPromised);
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
    active: true
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
    active: true
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
    sandbox.stub(principalService, 'findByIdentity').returns(Promise.resolve(user));
    sandbox.stub(userService, 'validatePassword').returns(Promise.resolve(true));
    sandbox.stub(userService, 'hasTotp').returns(Promise.resolve(false));
    sandbox.stub(serverSettings, 'getSetting').returns(true);
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
      expect(codeRedirectMock.calledOnceWithExactly(
        context, oauth2Client, 'redirect-uri', 'state', 'challenge-code', 'S256'
      )).to.be.true;
    });

    it('should set challenge code method to plain if not provided', async() => {
      params.delete('code_challenge_method');

      const request = new MemoryRequest('GET', '?' + params, 'http://localhost');
      const context = new Context(request, new MemoryResponse('http://localhost'));
      context.session = {
        user: {}
      };

      await authorize.get(context);
      expect(codeRedirectMock.calledOnceWithExactly(
        context, oauth2Client, 'redirect-uri', 'state', 'challenge-code', 'plain'
      )).to.be.true;
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
      expect(codeRedirectMock.calledOnceWithExactly(
        context, oauth2Client, 'redirect-uri', 'state', undefined, undefined
      )).to.be.true;
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
