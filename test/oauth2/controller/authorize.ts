import { MemoryRequest, BaseContext, MemoryResponse } from '@curveball/core';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import { InvalidRequest } from '../../../src/oauth2/errors';
import * as oauth2Service from '../../../src/oauth2/service';
import { OAuth2Client } from '../../../src/oauth2/types';
import authorize from '../../../src/oauth2/controller/authorize'

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('AuthorizeController', () => {
    const sandbox = sinon.createSandbox();
    let codeRedirectMock: sinon.SinonStub;
    const oauth2Client: OAuth2Client = {
        id: 1,
        clientId: 'client-id',
        clientSecret: Buffer.from('client-secret', 'utf-8'),
        user: {
            id: 1,
            identity: 'identity',
            nickname: 'nickname',
            created: new Date(1),
            type: 'user',
            active: true
        },
        allowedGrantTypes: ['authorization_code'],
    };
    let params: URLSearchParams;

    beforeEach(function () {
        sandbox.stub(oauth2Service, 'getClientByClientId').returns(Promise.resolve(oauth2Client));
        sandbox.stub(oauth2Service, 'validateRedirectUri').returns(Promise.resolve(true));
        codeRedirectMock = sandbox.stub(authorize, 'codeRedirect');

        params = new URLSearchParams({
            response_type: 'code',
            client_id: 'client-id',
            redirect_uri: 'redirect-uri',
            code_challenge: 'challenge-code',
            code_challenge_method: 'plain',
            state: 'state',
          });
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('get', () => {
        it('should pass valid parameters and call code redirect', async() => {
            const request = new MemoryRequest('GET', '?' + params);
            const context = new BaseContext(request, new MemoryResponse());
            context.state = {
                session: {
                    user: {}
                }
            };

            await authorize.get(context);
            expect(codeRedirectMock.calledOnceWithExactly(
                context, oauth2Client, 'redirect-uri', 'state', 'challenge-code', 'plain'
            )).to.be.true
        });

        it('should fail code challenge validation', async() => {
            params.set('code_challenge_method', 'bogus-method');

            const request = new MemoryRequest('GET', '?' + params);
            const context = new BaseContext(request, new MemoryResponse());
            context.state = {
                session: {
                    user: {}
                }
            };


            await expect(authorize.get(context)).to.be.rejectedWith(InvalidRequest, 'The "code_challenge_method" must be "plain" or "S256"')
        });

        it('should fail when code method is provided but not challenge', async() => {
            params.delete('code_challenge');

            const request = new MemoryRequest('GET', '?' + params);
            const context = new BaseContext(request, new MemoryResponse());
            context.state = {
                session: {
                    user: {}
                }
            };


            await expect(authorize.get(context)).to.be.rejectedWith(InvalidRequest, 'The "code_challenge" must be provided')
        });
    });
});
