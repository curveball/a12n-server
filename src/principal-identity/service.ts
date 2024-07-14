import { Principal, PrincipalIdentity } from "../types.js";
import knex from '../database.js';
import { PrincipalIdentityRecord } from "knex/types/tables.js";


export async function findByPrincipal(principal: Principal): Promise<PrincipalIdentity[]> {

  const result = await knex('principal_identity')
    .select()
    .where('principal_id', principal.id);

  return result.map(
    record => recordToModel(record)
  );

}

function recordToModel(record: PrincipalIdentityRecord): PrincipalIdentity {

  return {
    id: record.id,
    href: record.href,
    label: record.label,
    isPrimary: !!record.is_primary,
    verifiedAt: record.verified_at ? new Date(record.verified_at) : null,
    createdAt: new Date(record.created_at),
    modifiedAt: new Date(record.modified_at),
  }

}
