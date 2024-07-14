import { Principal, PrincipalIdentity, NewPrincipalIdentity } from '../types.js';
import knex from '../database.js';
import { PrincipalIdentityRecord } from 'knex/types/tables.js';
import { NotFound } from '@curveball/http-errors';


export async function findByPrincipal(principal: Principal): Promise<PrincipalIdentity[]> {

  const result = await knex('principal_identity')
    .select()
    .where('principal_id', principal.id);

  return result.map(
    record => recordToModel(record)
  );

}

export async function findByHref(href:string): Promise<PrincipalIdentity> {
  const result = await knex('principal_identity')
    .select()
    .where('href', href)
    .first();

  if (!result) throw new NotFound(`Principal with identity "${href}" not found`);

  return recordToModel(result);

}

export async function create(identity: NewPrincipalIdentity): Promise<void> {

  await knex('principal.identity')
    .insert({
      href: identity.href,
      principal_id: identity.principalId,
      label: identity.label ?? null,
      isPrimary: identity.isPrimary,
      verifiedAt: null,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });

}

function recordToModel(record: PrincipalIdentityRecord): PrincipalIdentity {

  return {
    id: record.id,
    principalId: record.principal_id,
    href: record.href,
    label: record.label,
    isPrimary: !!record.is_primary,
    verifiedAt: record.verified_at ? new Date(record.verified_at) : null,
    createdAt: new Date(record.created_at),
    modifiedAt: new Date(record.modified_at),
  };

}
