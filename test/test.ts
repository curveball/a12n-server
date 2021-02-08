import { getRelHref } from '../src/user/service';
import { expect } from 'chai';

describe('URI Test', () => {

  const expectedValue = '/user/1';

  it('should pass with full url passed in', () => {
    const url = 'http://test.com/user/1';
    const result = getRelHref(url);
    expect(result).to.equal(expectedValue);
  });

  it('should pass with relative url being passed in', () => {
    const url = '/user/1';
    const result = getRelHref(url);
    expect(result).to.equal(expectedValue);
  });

  it('should fail if URL doesn`t contain the opening /', () => {
    const url = 'user/1';
    const result = getRelHref(url);
    expect(result).to.not.equal(expectedValue);
  });

});
