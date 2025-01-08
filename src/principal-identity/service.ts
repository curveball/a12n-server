import { Principal, PrincipalIdentity, NewPrincipalIdentity } from '../types.js';
import knex, { insertAndGetId } from '../database.js';
import { PrincipalIdentitiesRecord } from 'knex/types/tables.js';
import { NotFound, MethodNotAllowed, BadRequest } from '@curveball/http-errors';
import { generatePublicId } from '../crypto.js';
import { sendTemplatedMail } from '../mailer/service.js';
import * as services from '../services.js';
import { generateVerificationDigits } from '../crypto.js';

export async function findByPrincipal(principal: Principal): Promise<PrincipalIdentity[]> {

  const result = await knex('principal_identities')
    .select()
    .where('principal_id', principal.id);

  return result.map(
    record => recordToModel(principal, record)
  );

}

export async function findById(principal: Principal, id:number): Promise<PrincipalIdentity> {

  const result = await knex('principal_identities')
    .select()
    .where('principal_id', principal.id)
    .first();

  if (!result) throw new NotFound(`Identity with id "${id}" not found on this principal.`);

  return recordToModel(principal, result);

}

export async function findByExternalId(principal: Principal, externalId: string): Promise<PrincipalIdentity> {

  const result = await knex('principal_identities')
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

    const result = await knex('principal_identities')
      .select()
      .where('uri', arg1)
      .first();

    if (!result) throw new NotFound(`Identity "${arg1}" not found`);
    const principalService = new services.principal.PrincipalService('insecure');
    const principalObj = await principalService.findById(result.principal_id);

    return recordToModel(principalObj, result);

  } else {
    const result = await knex('principal_identities')
      .select()
      .where({principal_id: arg1.id, uri: arg2})
      .first();

    if (!result) throw new NotFound(`Identity "${arg2}" not found`);

    return recordToModel(arg1, result);

  }

}

export async function create(identity: NewPrincipalIdentity): Promise<PrincipalIdentity> {

  const externalId = await generatePublicId();

  const id = await insertAndGetId('principal_identities', {
    uri: identity.uri,
    external_id: externalId,
    principal_id: identity.principal.id,
    label: identity.label ?? null,
    is_primary: identity.isPrimary ? 1 : 0,
    verified_at: identity.markVerified ? Date.now() : null,
    created_at: Date.now(),
    modified_at: Date.now(),
  });

  return {
    id,
    href: `${identity.principal.href}/identity/${externalId}`,
    externalId,
    ...identity,
    verifiedAt: new Date(),
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

}
export async function markVerified(identity: PrincipalIdentity): Promise<void> {

  await knex('principal_identities')
    .update({
      verified_at: Date.now(),
    })
    .where({
      id: identity.id,
    });

}

export async function sendVerificationRequest(identity: PrincipalIdentity, ip: string): Promise<void> {

  if (!identity.uri.startsWith('mailto:')) {
    throw new MethodNotAllowed('Only email identities can be verified currently. Make a feature request if you want to support other kinds of identities');
  }

  await sendTemplatedMail({
    templateName: 'emails/verify-email',
    to: identity.uri.slice(7),
    subject: 'Verify your email',
  }, {
    code: await getCodeForIdentity(identity),
    expireMinutes: CODE_LIFETIME_MINUTES,
    name: identity.principal.nickname,
    date: new Date().toISOString(),
    ip,
  });

}
export async function sendOtpRequest(identity: PrincipalIdentity, ip: string): Promise<void> {

  if (!identity.uri.startsWith('mailto:')) {
    throw new MethodNotAllowed('Only email identities can be verified currently. Make a feature request if you want to support other kinds of identities');
  }
  if (!identity.isMfa) {
    throw new MethodNotAllowed('This identity is not configured for mfa');
  }

  await sendTemplatedMail({
    templateName: 'emails/totp-email',
    to: identity.uri.slice(7),
    subject: 'Your login code',
  }, {
    code: await getCodeForIdentity(identity),
    expireMinutes: CODE_LIFETIME_MINUTES,
    name: identity.principal.nickname,
    date: new Date().toISOString(),
    ip,
  });

}

const identityNS = 'a12n:identity-verification:';

export async function verifyIdentity(identity: PrincipalIdentity, code: string): Promise<void> {

  const storedCode = await services.kv.get(identityNS + identity.externalId);
  // Delete code after, whether it was correct or not.
  await services.kv.del(identityNS + identity.externalId);

  if (storedCode === null) {
    throw new BadRequest('Verification code incorrect or expired. Try restarting the verification process');
  } else if (storedCode !== code) {
    throw new BadRequest('Verification code incorrect');
  }

  await markVerified(identity);

}

const CODE_LIFETIME_MINUTES = 30;

/**
 * Generates a secret code for an identity that may be used to validate ownership later.
 *
 * An identity will only have 1 active code.
 */
async function getCodeForIdentity(identity: PrincipalIdentity): Promise<string> {

  const code = generateVerificationDigits();
  await services.kv.set(
    identityNS + identity.externalId,
    code,
    { ttl: CODE_LIFETIME_MINUTES * 60000 }
  );
  return code;

}

function recordToModel(principal: Principal, record: PrincipalIdentitiesRecord): PrincipalIdentity {

  return {
    id: record.id,
    uri: record.uri,
    principal,
    href: `${principal.href}/identity/${record.external_id}`,
    externalId: record.external_id,
    label: record.label,
    isPrimary: !!record.is_primary,
    isMfa: !!record.is_mfa,
    verifiedAt: record.verified_at ? new Date(+record.verified_at) : null,
    createdAt: new Date(+record.created_at),
    modifiedAt: new Date(+record.modified_at),
  };

}
