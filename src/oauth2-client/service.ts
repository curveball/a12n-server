import { OAuth2Client, GrantType } from './types';
import * as bcrypt from 'bcrypt';
import * as principalService from '../principal/service';
import db from '../database';
import { Context } from '@curveball/core';
import { NotFound, Unauthorized } from '@curveball/http-errors';
import { InvalidRequest } from '../oauth2/errors';
import parseBasicAuth from './parse-basic-auth';
import { App } from '../principal/types';

type OAuth2ClientRecord = {
  id: number;
  client_id: string;
  client_secret: Buffer;
  user_id: number;
  allowed_grant_types: string;
};


export async function findByClientId(clientId: string): Promise<OAuth2Client> {

  const query = 'SELECT id, client_id, client_secret, user_id, allowed_grant_types FROM oauth2_clients WHERE client_id = ?';
  const result = await db.query(query, [clientId]);

  if (!result.length) {
    throw new NotFound('OAuth2 client_id not recognized');
  }

  const record: OAuth2ClientRecord = result[0];

  const user = await principalService.findActiveById(record.user_id) as App;
  return mapRecordToModel(record, user);

}

export async function findById(id: number): Promise<OAuth2Client> {

  const query = 'SELECT id, client_id, client_secret, user_id, allowed_grant_types FROM oauth2_clients WHERE id = ?';
  const result = await db.query(query, [id]);

  if (!result.length) {
    throw new NotFound('OAuth2 id not recognized');
  }

  const record: OAuth2ClientRecord = result[0];

  const user = await principalService.findActiveById(record.user_id) as App;
  return mapRecordToModel(record, user);

}

export async function findByApp(user: App): Promise<OAuth2Client[]> {

  const query = 'SELECT id, client_id, client_secret, user_id, allowed_grant_types FROM oauth2_clients WHERE user_id = ?';
  const result = await db.query(query, [user.id]);

  return result.map( (record: OAuth2ClientRecord) => mapRecordToModel(record, user));

}

function mapRecordToModel(record: OAuth2ClientRecord, app: App): OAuth2Client {

  return {
    id: record.id,
    clientId: record.client_id,
    clientSecret: record.client_secret.toString('utf-8'),
    app,
    allowedGrantTypes: record.allowed_grant_types.split(' ') as GrantType[],
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

export async function create(client: Omit<OAuth2Client, 'id'>, redirectUris: string[]): Promise<OAuth2Client> {

  const params: Partial<OAuth2ClientRecord> = {
    client_id: client.clientId,
    client_secret: Buffer.from(client.clientSecret),
    user_id: client.app.id,
    allowed_grant_types: client.allowedGrantTypes.join(' '),
  };

  const connection = await db.getConnection();
  const result = await connection<OAuth2ClientRecord>('oauth2_clients')
    .insert(params, 'id')
    .returning('id');

  const newClient = await connection<OAuth2ClientRecord, OAuth2ClientRecord>('oauth2_client')
    .select({ id: result })
    .returning('*');

  const realClient = mapToOauth2Client(newClient[0], client.app, client.allowedGrantTypes);

  for(const uri of redirectUris) {

    await connection('oauth2_redirect_uris').insert({oauth2_client_id: realClient.id, uri});

  }

  return realClient;

}


export async function validateSecret(oauth2Client: OAuth2Client, secret: string): Promise<boolean> {

  return await bcrypt.compare(secret, oauth2Client.clientSecret);

}

function mapToOauth2Client(data: OAuth2ClientRecord, app: App, allowedGrantTypes: GrantType[]): OAuth2Client {
  return {
    id: data.id,
    clientId: data.client_id,
    clientSecret: data.client_secret.toString(),
    app,
    allowedGrantTypes,
  };
}

