import { Context } from '@curveball/core';
import db from '../database';
import { EventType } from './types';

export default async function log(
  ctx: Context,
  eventType: EventType,
) {

  const userId = ctx.state.user.id ? ctx.state.user.id : null;
  await db.query('INSERT INTO user_auth_log SET time = UNIX_TIMESTAMP, ?', {
    user_id: userId,
    event_type: eventType,
    ip: ctx.ip()
  });

}
