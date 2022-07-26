import { OAuth2Client, GrantType } from './types';
import * as bcrypt from 'bcrypt';
import * as principalService from '../principal/service';
import db, { insertAndGetId } from '../database';
import { Context } from '@curveball/core';
import { NotFound, Unauthorized, Conflict } from '@curveball/http-errors';
import { InvalidRequest } from '../oauth2/errors';
import parseBasicAuth from './parse-basic-auth';
import { App } from '../principal/types';
import { OAuth2Client as OAuth2ClientRecord } from 'knex/types/tables';
import { wrapError, UniqueViolationError } from 'db-errors';

export async function findByClientId(clientId: string): Promise<OAuth2Client> {

  const result = await db('oauth2_clients')
    .select('*')
    .where('client_id', clientId);

  if (!result.length) {
    throw new NotFound('OAuth2 client_id not recognized');
  }

  const record: OAuth2ClientRecord = result[0];

  const app = await principalService.findById(record.user_id, 'app');
  if (!app.active) {
    throw new Error(`App ${app.nickname} is not active`);
  }
  return mapRecordToModel(record, app);

}

export async function findById(id: number): Promise<OAuth2Client> {

  const result = await db('oauth2_clients')
    .select('*')
    .where('id', id);

  if (!result.length) {
    throw new NotFound('OAuth2 id not recognized');
  }

  const record: OAuth2ClientRecord = result[0];

  const app = await principalService.findById(record.user_id, 'app');
  if (!app.active) {
    throw new Error(`App ${app.nickname} is not active`);
  }
  return mapRecordToModel(record, app);

}

export async function findByApp(app: App): Promise<OAuth2Client[]> {

  const result = await db('oauth2_clients')
    .select('*')
    .where('user_id', app.id);

  return result.map( (record: OAuth2ClientRecord) => mapRecordToModel(record, app));

}

function mapRecordToModel(record: OAuth2ClientRecord, app: App): OAuth2Client {

  return {
    id: record.id,
    href: `${app.href}/client/${record.client_id}`,
    clientId: record.client_id,
    clientSecret: record.client_secret,
    app,
    allowedGrantTypes: record.allowed_grant_types.split(' ') as GrantType[],
    requirePkce: !!record.require_pkce,
  };

}

export async function getOAuth2ClientFromBasicAuth(ctx: Context): Promise<OAuth2Client> {

  let oauth2Client: OAuth2Client;

  const basicAuth = parseBasicAuth(ctx);
  if (!basicAuth) {
    throw new Unauthorized('Invalid Basic Auth header');
  }

  try {
    oauth2Client = await findByClientId(basicAuth[0]);
  } catch (e) {
    if (e instanceof NotFound) {
      throw new Unauthorized('Client id or secret incorrect', 'Basic');
    } else {
      // Rethrow
      throw e;
    }
  }
  if (!await validateSecret(oauth2Client, basicAuth[1])) {
    throw new Unauthorized('Client id or secret incorrect', 'Basic');
  }

  return oauth2Client;

}

export async function getOAuth2ClientFromBody(ctx: Context<any>): Promise<OAuth2Client> {

  if (!ctx.request.body.client_id) {
    throw new InvalidRequest('The "client_id" property is required');
  }

  try {
    return await findByClientId(ctx.request.body.client_id);
  } catch (e) {
    if (e instanceof NotFound) {
      throw new Unauthorized('Client id unknown', 'Basic');
    } else {
      // Rethrow
      throw e;
    }
  }

}

export async function create(client: Omit<OAuth2Client, 'id'|'href'>, redirectUris: string[]): Promise<OAuth2Client> {

  const params: Partial<OAuth2ClientRecord> = {
    client_id: client.clientId,
    client_secret: client.clientSecret,
    user_id: client.app.id,
    allowed_grant_types: client.allowedGrantTypes.join(' '),
    require_pkce: client.requirePkce?1:0,
  };

  let result;

  try {
    result = await insertAndGetId('oauth2_clients', params);
    for(const uri of redirectUris) {

      await db('oauth2_redirect_uris').insert({oauth2_client_id: result, uri});

    }

  } catch (err: any) {
    const error =  wrapError(err);

    if (error instanceof UniqueViolationError) {
      throw new Conflict('Client ID already exists');
    } else {
      throw error;
    }
  }


  return {
    id: result,
    href: `${client.app.href}/client/${client.clientId}`,
    ...client,
  };

}

export async function edit(client: OAuth2Client, redirectUris: string[]): Promise<void> {

  const params: Partial<OAuth2ClientRecord> = {
    allowed_grant_types: client.allowedGrantTypes.join(' '),
    require_pkce: client.requirePkce?1:0,
  };

  await db.transaction(async trx => {

    await trx('oauth2_clients').update(params).where({id: client.id});
    await trx('oauth2_redirect_uris').delete().where({oauth2_client_id: client.id});

    for(const uri of redirectUris) {

      await trx('oauth2_redirect_uris').insert({oauth2_client_id: client.id, uri});

    }
  });

}

export async function validateSecret(oauth2Client: OAuth2Client, secret: string): Promise<boolean> {

  return await bcrypt.compare(secret, oauth2Client.clientSecret);

}
