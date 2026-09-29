import { userInfo } from '../../src/oidc/format/json.ts';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { User } from '../../src/types.ts';

describe('OIDC userInfo', () => {

  const user: User = {
    id: 1,
    href: '/user/-ni5Qd6WUVM',
    externalId: '-ni5Qd6WUVM',
    type: 'user',
    nickname: 'Test user',
    createdAt: new Date(),
    modifiedAt: new Date(),
    active: true,
    system: false,
  };

  it('should use the same sub as the id_token', () => {
    // The id_token uses principal.href as the subject. OIDC requires the
    // userinfo sub to be identical.
    const result = userInfo(user, []);
    assert.equal(result.sub, user.href);
  });

});
