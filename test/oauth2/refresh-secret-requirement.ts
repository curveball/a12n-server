import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { ensureRefreshSecretRequirement } from '../../src/oauth2/service.js';

describe('ensureRefreshSecretRequirement', () => {
  it('throws when original token used a secret and refresh does not authenticate', () => {
    assert.throws(
      () => ensureRefreshSecretRequirement(true, false),
      /client authentication/i
    );
  });

  it('allows refresh when both original and current requests use a secret', () => {
    assert.doesNotThrow(() => ensureRefreshSecretRequirement(true, true));
  });

  it('allows refresh when original token did not use a secret', () => {
    assert.doesNotThrow(() => ensureRefreshSecretRequirement(false, false));
  });
});
