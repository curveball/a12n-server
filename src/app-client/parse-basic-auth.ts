import { Context } from '@curveball/core';

export default function parseBasic(ctx: Context): null | [string, string] {

  const authHeader = ctx.request.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ', 2);
  if (parts.length < 2 || parts[0].toLowerCase() !== 'basic') {
    return null;
  }

  const decodedMatch = Buffer.from(parts[1], 'base64').toString().match(/^([^:]+):(.+)/);
  if (!decodedMatch) {
    return null;
  }

  return [decodedMatch[1], decodedMatch[2]] as [string, string];

}
