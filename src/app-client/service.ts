import * as bcrypt from 'bcrypt';
import { Context } from '@curveball/core';
import { NotFound, Unauthorized, Conflict } from '@curveball/http-errors';
import { AppClientsRecord } from 'knex/types/tables.js';
import { wrapError, UniqueViolationError } from 'db-errors';

import { PrincipalService } from '../principal/service.js';
import db, { insertAndGetId } from '../database.js';
import { InvalidRequest } from '../oauth2/errors.js';
import parseBasicAuth from './parse-basic-auth.js';
import { App, GrantType, AppClient } from '../types.js';

export async function findByClientId(clientId: string): Promise<AppClient> {

  const result = await db('app_clients')
    .select('*')
    .where('client_id', clientId);

  if (!result.length) {
    throw new NotFound('OAuth2 client_id not recognized');
  }

  const record: AppClientsRecord = result[0];

  const principalService = new PrincipalService('insecure');
  const app = await principalService.findById(record.user_id, 'app');
  if (!app.active) {
    throw new Error(`App ${app.nickname} is not active`);
  }
  return mapRecordToModel(record, app);

}

export async function findById(id: number): Promise<AppClient> {

  if (id === 0) {
    // The clientId 0 is used when creating 'developer tokens'. I don't think
    // this was good design and should be considered technical debt.
    throw new Error('Invalid id passed. This is a bug');
  }
  const result = await db('app_clients')
    .select('*')
    .where('id', id);

  if (!result.length) {
    throw new NotFound('OAuth2 id not recognized');
  }

  const record: AppClientsRecord = result[0];

  const principalService = new PrincipalService('insecure');
  const app = await principalService.findById(record.user_id, 'app');
  if (!app.active) {
    throw new Error(`App ${app.nickname} is not active`);
  }
  return mapRecordToModel(record, app);

}

export async function findByApp(app: App): Promise<AppClient[]> {

  const result = await db('app_clients')
    .select('*')
    .where('user_id', app.id);

  return result.map( (record: AppClientsRecord) => mapRecordToModel(record, app));

}

function mapRecordToModel(record: AppClientsRecord, app: App): AppClient {

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

export async function getAppClientFromBasicAuth(ctx: Context): Promise<AppClient> {

  let oauth2Client: AppClient;

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

export async function getAppClientFromBody(ctx: Context<any>): Promise<AppClient> {

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

export async function create(client: Omit<AppClient, 'id'|'href'>, redirectUris: string[]): Promise<AppClient> {

  const params: Partial<AppClientsRecord> = {
    client_id: client.clientId,
    client_secret: client.clientSecret,
    user_id: client.app.id,
    allowed_grant_types: client.allowedGrantTypes.join(' '),
    require_pkce: client.requirePkce?1:0,
  };

  let result;

  try {
    result = await insertAndGetId('app_clients', params);
    for(const uri of redirectUris) {

      await db('oauth2_redirect_uris').insert({app_client_id: result, uri});

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

export async function edit(client: AppClient, redirectUris: string[]): Promise<void> {

  const params: Partial<AppClientsRecord> = {
    allowed_grant_types: client.allowedGrantTypes.join(' '),
    require_pkce: client.requirePkce?1:0,
  };

  await db.transaction(async trx => {

    await trx('app_clients').update(params).where({id: client.id});
    await trx('oauth2_redirect_uris').delete().where({app_client_id: client.id});

    for(const uri of redirectUris) {

      await trx('oauth2_redirect_uris').insert({app_client_id: client.id, uri});

    }
  });

}

export async function validateSecret(oauth2Client: AppClient, secret: string): Promise<boolean> {

  return await bcrypt.compare(secret, oauth2Client.clientSecret);

}
