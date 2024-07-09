import { ServerStats } from '../types.js';
import { getPrincipalStats } from '../principal/service.js';
import { findPrivilegeTypes } from '../privilege/service.js';
import { lastTokenId } from '../oauth2/service.js';

export async function getServerStats(): Promise<ServerStats> {

  return {
    ...await getPrincipalStats(),
    privileges: (await findPrivilegeTypes()).length,
    tokensIssued: (await lastTokenId()),
  };

}
