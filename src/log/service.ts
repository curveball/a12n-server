import { Context } from '@curveball/core';
import db from '../database';
import { EventType } from './types';

export function log(eventType: EventType, ctx: Context): Promise<void>;
export function log(eventType: EventType, ip: string, userId: number): Promise<void>;
export default async function log(
  eventType: EventType,
  arg1: string | Context,
  arg2?: number,
) {

  if (isContext(arg1)) {
    addLogEntry(
      eventType,
      arg1.ip(),
      arg1.state.session.user && arg1.state.session.user.id ? arg1.state.session.user.id : null
    );
  } else {
    addLogEntry(eventType, arg1, arg2);
  }

}

export async function addLogEntry(eventType: EventType, ip: string, userId: number): Promise<void> {

  await db.query('INSERT INTO user_log SET time = UNIX_TIMESTAMP(), ?', {
    user_id: userId,
    event_type: eventType,
    ip: ip
  });

}

function isContext(ctx: any): ctx is Context {

  return ((<Context> ctx).ip !== undefined);

}
