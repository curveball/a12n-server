import { generateSecretToken, uuidUrn } from '../src/crypto.js';
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

});
