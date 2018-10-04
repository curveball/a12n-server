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

  let userId, ip;
  if (isContext(arg1)) {
    userId = arg1.state.user.id ? arg1.state.user.id : null;
    ip = arg1.ip();
  } else {
    ip = arg1;
    userId = arg2;
  }
  await db.query('INSERT INTO user_log SET time = UNIX_TIMESTAMP(), ?', {
    user_id: userId,
    event_type: eventType,
    ip: ip
  });

}

function isContext(ctx: any): ctx is Context {

  return ((<Context> ctx).ip !== undefined);

}
