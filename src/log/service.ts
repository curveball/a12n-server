import { Context } from '@curveball/core';
import db from '../database';
import { User } from '../user/types';
import { EventType, LogEntry } from './types';
import * as geoip from 'geoip-lite';

export function log(eventType: EventType, ctx: Context): Promise<void>;
export function log(eventType: EventType, ip: string|null, userId: number, userAgent: string|null): Promise<void>;
export default async function log(
  eventType: EventType,
  arg1: string | Context | null,
  arg2?: number,
  arg3?: string|null
) {

  if (isContext(arg1)) {
    await addLogEntry(
      eventType,
      arg1.ip()!,
      arg1.state.session.user && arg1.state.session.user.id ? arg1.state.session.user.id : null,
      arg1.request.headers.get('User-Agent'),
    );
  } else {
    await addLogEntry(eventType, arg1, arg2!, arg3!);
  }

}

export async function addLogEntry(eventType: EventType, ip: string|null, userId: number, userAgent: string|null): Promise<void> {

  await db.query('INSERT INTO user_log SET time = UNIX_TIMESTAMP(), ?', {
    user_id: userId,
    event_type: eventType,
    ip: ip,
    user_agent: userAgent,
    country: ip ? getCountryByIp(ip) : null,
  });

}

type LogRow = {
  id: number,
  user_id: number,
  ip: string,
  time: number,
  event_type: EventType,
  user_agent: string,
  country: string
};

export async function findByUser(user: User): Promise<LogEntry[]> {

  const result:[LogRow[], any] = await db.query(
    'SELECT * FROM user_log WHERE user_id = ?',
    [user.id]
  );
  return result[0].map( (row: LogRow) => {
    return {
      time: new Date(row.time * 1000),
      ip: row.ip,
      eventType: row.event_type,
      userAgent: row.user_agent,
      country: row.country
    };
  });

}

function isContext(ctx: any): ctx is Context {

  return ((<Context> ctx).ip !== undefined);

}

function getCountryByIp(ip: string): string|undefined {

  return geoip.lookup(ip)?.country;

}
