import { getPathName } from '../../src/principal/service.js';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

describe('getPathName', () => {

  const expected = '/user/1';

  it('should pass with a full url passed in', () => {
    const url = 'http://test.com/user/1';
    const result = getPathName(url);
    assert.equal(result, expected);
  });

  it('should pass with a relative url being passed in', () => {
    const url = '/user/1';
    const result = getPathName(url);
    assert.equal(result, expected);
  });

});
