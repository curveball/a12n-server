import { ServerStats } from '../types';
import { getPrincipalStats } from '../principal/service';
import { findPrivilegeTypes } from '../privilege/service';
import { lastTokenId } from '../oauth2/service';

export async function getServerStats(): Promise<ServerStats> {

  return {
    ...await getPrincipalStats(),
    privileges: (await findPrivilegeTypes()).length,
    tokensIssued: (await lastTokenId()),
  };

}
