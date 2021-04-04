import { generateSecretToken } from '../src/crypto';
import { expect } from 'chai';

describe('Crypto utilities', () => {

  describe('generateSecretToken', () => {

    it('Should generate a 32-byte secret token', async () => {

      const token = await generateSecretToken();

      expect(token.length).to.equal(Math.ceil(32 / 3 * 4));

    });
    it('Should generate different length tokens when requested', async () => {

      const token = await generateSecretToken(9);

      expect(token.length).to.equal(Math.ceil(9 / 3) * 4);

    });

  });

});
