import { Principal, PrincipalIdentity, NewPrincipalIdentity } from '../types.js';
import knex from '../database.js';
import { PrincipalIdentityRecord } from 'knex/types/tables.js';
import { NotFound } from '@curveball/http-errors';
import { generatePublicId } from '../crypto.js';
import { PrincipalService } from '../principal/service.js';

export async function findByPrincipal(principal: Principal): Promise<PrincipalIdentity[]> {

  const result = await knex('principal_identity')
    .select()
    .where('principal_id', principal.id);

  return result.map(
    record => recordToModel(principal, record)
  );

}

export async function findByExternalId(principal: Principal, externalId: string): Promise<PrincipalIdentity> {

  const result = await knex('principal_identity')
    .select()
    .where({external_id: externalId, principal_id: principal.id})
    .first();

  if (!result) throw new NotFound(`Identity with id "${externalId}" not found on this principal.`);

  return recordToModel(principal, result);


}

export async function findByUri(uri:string): Promise<PrincipalIdentity>;
export async function findByUri(principal: Principal, uri:string): Promise<PrincipalIdentity>;
export async function findByUri(arg1: Principal|string, arg2?:string): Promise<PrincipalIdentity> {

  if (typeof arg1 === 'string') {

    const result = await knex('principal_identity')
      .select()
      .where('uri', arg1)
      .first();

    if (!result) throw new NotFound(`Identity "${arg1}" not found`);
    const principalService = new PrincipalService('insecure');
    const principalObj = await principalService.findById(result.principal_id);

    return recordToModel(principalObj, result);

  } else {
    const result = await knex('principal_identity')
      .select()
      .where({principal_id: arg1.id, uri: arg2})
      .first();

    if (!result) throw new NotFound(`Identity "${arg2}" not found`);

    return recordToModel(arg1, result);

  }

}

export async function create(identity: NewPrincipalIdentity): Promise<void> {

  await knex('principal_identity')
    .insert({
      uri: identity.uri,
      external_id: await generatePublicId(),
      principal_id: identity.principalId,
      label: identity.label ?? null,
      is_primary: identity.isPrimary ? 1 : 0,
      verified_at: null,
      created_at: Date.now(),
      modified_at: Date.now(),
    });

}

function recordToModel(principal: Principal, record: PrincipalIdentityRecord): PrincipalIdentity {

  return {
    id: record.id,
    uri: record.uri,
    principalId: record.principal_id,
    href: `${principal.href}/identity/${record.external_id}`,
    externalId: record.external_id,
    label: record.label,
    isPrimary: !!record.is_primary,
    verifiedAt: record.verified_at ? new Date(record.verified_at) : null,
    createdAt: new Date(record.created_at),
    modifiedAt: new Date(record.modified_at),
  };

}
