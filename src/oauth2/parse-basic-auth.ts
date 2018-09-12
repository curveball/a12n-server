import { Context } from '@curveball/core';

export default function parseBasic(ctx: Context): null | [string, string] {

  const authHeader = ctx.request.headers.get('Authorization');
  console.log(authHeader);
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ', 2);
  console.log(parts);
  if (parts.length < 2 || parts[0].toLowerCase() !== 'basic') {
    return null;
  }

  const decoded = Buffer.from(parts[1], 'base64').toString().split(':', 2);
  console.log(decoded);
  if (decoded.length < 2) {
    return null;
  }

  return <[string, string]> decoded;

}
