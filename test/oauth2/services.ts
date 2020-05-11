import { expect } from 'chai';

import { InvalidGrant } from '../../src/oauth2/errors';
import { validatePKCE } from '../../src/oauth2/service'

describe('oauth2 services', () => {
    describe('oauth2 validatePKCE', () => {
        it('should validate the sha256 codeVerifier', () => {
            const codeVerifier = 'BwUZNJDORebJpJCDjEj836gqlSSwoKBP1_s3s96Y3AA';
            const codeChallenge = 'VoyAMKJrUrfPcl7WoRJwj-MKNhgqTUMes97-HGvlbsA';
            const codeChallengeMethod = 'sha256'

            expect(() => validatePKCE(codeVerifier, codeChallenge, codeChallengeMethod)).to.not.throw();
        });

        it('should fail to validate the sha256 codeVerifier', () => {
            const codeVerifier = 'bogus-code';
            const codeChallenge = 'VoyAMKJrUrfPcl7WoRJwj-MKNhgqTUMes97-HGvlbsA';
            const codeChallengeMethod = 'sha256'

            expect(() => validatePKCE(codeVerifier, codeChallenge, codeChallengeMethod)).to.throw(InvalidGrant, 'The code verifier does not match the code challenge');
        });

        it('should validate the plain codeVerifier', () => {
            const codeVerifier = 'plain-code';
            const codeChallenge = 'plain-code';
            const codeChallengeMethod = 'plain'

            expect(() => validatePKCE(codeVerifier, codeChallenge, codeChallengeMethod)).to.not.throw();
        });

        it('should fail to validate the plain codeVerifier', () => {
            const codeVerifier = 'bogus-code';
            const codeChallenge = 'plain-code';
            const codeChallengeMethod = 'plain'

            expect(() => validatePKCE(codeVerifier, codeChallenge, codeChallengeMethod)).to.throw(InvalidGrant, 'The code verifier does not match the code challenge');
        });
    });
  });
