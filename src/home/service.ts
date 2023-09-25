import { ServerStats } from '../types';
import { getPrincipalStats } from '../principal/privileged-service';
import { findPrivileges } from '../privilege/service';
import { lastTokenId } from '../oauth2/service';

export async function getServerStats(): Promise<ServerStats> {

  return {
    ...await getPrincipalStats(),
    privileges: (await findPrivileges()).length,
    tokensIssued: (await lastTokenId()),
  };

}
