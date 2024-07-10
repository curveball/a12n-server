import { getPathName } from '../../src/principal/service.js';
import { expect } from 'chai';
import { describe, it } from 'node:test';

describe('getPathName', () => {

  const expected = '/user/1';

  it('should pass with a full url passed in', () => {
    const url = 'http://test.com/user/1';
    const result = getPathName(url);
    expect(result).to.equal(expected);
  });

  it('should pass with a relative url being passed in', () => {
    const url = '/user/1';
    const result = getPathName(url);
    expect(result).to.equal(expected);
  });

});
