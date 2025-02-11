import { ServerStats } from '../types.ts';
import { getPrincipalStats } from '../principal/service.ts';
import { findPrivilegeTypes } from '../privilege/service.ts';
import { lastTokenId } from '../oauth2/service.ts';

export async function getServerStats(): Promise<ServerStats> {

  return {
    ...await getPrincipalStats(),
    privileges: (await findPrivilegeTypes()).length,
    tokensIssued: (await lastTokenId()),
  };

}
