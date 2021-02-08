import { getPathName } from '../../src/user/service';
import { expect } from 'chai';

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
