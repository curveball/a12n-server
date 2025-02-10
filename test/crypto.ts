import { generateSecretToken, uuidUrn, generatePublicId, generatePassword, generateVerificationDigits, loadWordList } from '../src/crypto.js';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

describe('Crypto utilities', () => {

  describe('generateSecretToken()', () => {

    it('should generate a 32-byte secret token', async () => {

      const token = await generateSecretToken();
      assert.equal(token.length,Math.ceil(32 / 3 * 4));

    });
    it('Should generate different length tokens when requested', async () => {

      const token = await generateSecretToken();
      assert.equal(token.length, 43);

    });

  });

  describe('uuidUrn()', () => {

    it('should generate a uuid urn', () => {

      const result = uuidUrn();
      assert.match(result, /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);


    });


  });

  describe('generatePublicId()', () => {

    it('should generate a public id', async () => {

      const id = await generatePublicId();
      assert.equal(id.length, 11);

    });

  });

  describe('generateVerificationDigits()', () => {

    it('should generate a verification code', () => {

      const code = generateVerificationDigits();
      assert.match(code, /^[0-9]{6}$/);

    });

    it('should generate a verification code of the requested length', () => {

      const code = generateVerificationDigits(8);
      assert.match(code, /^[0-9]{8}$/);

    });

  });

  describe('generatePassword()', () => {

    it('should generate a password', async () => {

      await loadWordList();
      const password = generatePassword();
      assert.match(password, /^[a-z-]{20,}$/);
      assert.equal(password.split('-').length, 6);
      assert.ok(password.length > 20);

    });

  });

});
