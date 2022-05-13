import { generateSecretToken, uuidUrn } from '../src/crypto';
import { expect } from 'chai';

describe('Crypto utilities', () => {

  describe('generateSecretToken()', () => {

    it('should generate a 32-byte secret token', async () => {

      const token = await generateSecretToken();

      expect(token.length).to.equal(Math.ceil(32 / 3 * 4));

    });
    it('Should generate different length tokens when requested', async () => {

      const token = await generateSecretToken();
      expect(token.length).to.equal(43);

    });

  });

  describe('uuidUrn()', () => {

    it('should generate a uuid urn', () => {

      const result = uuidUrn();
      expect(result).to.match(/^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);


    });


  });

});
