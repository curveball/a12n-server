import { expect } from 'chai';
import { describe, it } from 'node:test';

import { InvalidGrant, InvalidRequest } from '../../src/oauth2/errors.js';
import { validatePKCE } from '../../src/oauth2/service.js';

describe('oauth2 services', () => {
  describe('oauth2 validatePKCE', () => {
    it('should validate the sha256 codeVerifier', () => {
      const codeVerifier = 'S4O8Jlv9ltbnCgmvzfIi9NnQ5d7CzSpG8QqnV7NGGQ8';
      const codeChallenge = 'SYyy6WKPGGJ46cMDMJ6ro9tgRJHoWOqPrEAcSw8wmc8';
      const codeChallengeMethod = 'S256';

      expect(() => validatePKCE(codeVerifier, codeChallenge, codeChallengeMethod)).to.not.throw();
    });

    it('should fail to validate the sha256 codeVerifier', () => {
      const codeVerifier = 'bogus-code';
      const codeChallenge = 'SYyy6WKPGGJ46cMDMJ6ro9tgRJHoWOqPrEAcSw8wmc8';
      const codeChallengeMethod = 'S256';

      expect(() => validatePKCE(codeVerifier, codeChallenge, codeChallengeMethod)).to.throw(InvalidGrant, 'The code verifier does not match the code challenge');
    });

    it('should validate the plain codeVerifier', () => {
      const codeVerifier = 'plain-code';
      const codeChallenge = 'plain-code';
      const codeChallengeMethod = 'plain';

      expect(() => validatePKCE(codeVerifier, codeChallenge, codeChallengeMethod)).to.not.throw();
    });

    it('should fail to validate the plain codeVerifier', () => {
      const codeVerifier = 'bogus-code';
      const codeChallenge = 'plain-code';
      const codeChallengeMethod = 'plain';

      expect(() => validatePKCE(codeVerifier, codeChallenge, codeChallengeMethod)).to.throw(InvalidGrant, 'The code verifier does not match the code challenge');
    });

    it('should fail if the code verifier is not supplied', () => {
      const codeVerifier = undefined;
      const codeChallenge = 'plain-code';
      const codeChallengeMethod = 'plain';

      expect(() => validatePKCE(codeVerifier, codeChallenge, codeChallengeMethod)).to.throw(InvalidRequest, 'The code verifier was not supplied');
    });
  });
});
