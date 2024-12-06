import { Context } from '@curveball/core';
import db from '../database.js';
import { Principal } from '../types.js';
import { EventType, LogEntry, reverseEventTypeMap, UserEventLogger, eventTypeMap } from './types.js';
import geoip from 'geoip-lite';
import { UserLogRecord } from 'knex/types/tables.js';

export function getLoggerFromContext(ctx: Context, principal?: Principal|number): UserEventLogger {

  let principalId;
  if (typeof principal === 'number') {
    principalId = principal;
  } else {
    principalId = principal?.id ?? ctx.session.user?.id;
  }
  return (et: EventType) => addLogEntry(
    et,
    ctx.ip() ?? '',
    principalId,
    ctx.request.headers.get('User-Agent')
  );
}

export function getLogger(principal: Principal | number, ip: string|null, userAgent: string|null) {

  return (et: EventType) => addLogEntry(
    et,
    ip ?? '',
    typeof principal === 'number' ? principal : principal.id,
    userAgent
  );

}


export async function addLogEntry(eventType: EventType, ip: string, userId: number, userAgent: string|null): Promise<void> {

  await db('user_log').insert({
    user_id: userId,
    time: Math.floor(Date.now() / 1000),
    event_type: eventTypeMap[eventType],
    ip: ip,
    user_agent: userAgent,
    country: ip ? getCountryByIp(ip) : null,
  });

}

export async function findByUser(user: Principal): Promise<LogEntry[]> {

  const result = await db('user_log')
    .select('*')
    .where({user_id: user.id})
    .orderBy('time', 'desc');

  return result.map( (row: UserLogRecord) => {
    return {
      time: new Date(row.time * 1000),
      ip: row.ip,
      eventType: reverseEventTypeMap.get(row.event_type)!,
      userAgent: row.user_agent,
      country: row.country
    };
  });

}

function getCountryByIp(ip: string): string|null {

  return geoip.lookup(ip)?.country || null;

}
