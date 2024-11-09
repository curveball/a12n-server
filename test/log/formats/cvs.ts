import { expect } from 'chai';
import { describe, it } from 'node:test';

import csv from '../../../src/log/formats/csv.js';
import { LogEntry } from '../../../src/log/types.js';

describe('csv', () => {
  it('should return formatted log string', () => {
    const log: LogEntry[] = [
      {
        time: new Date(0),
        ip: '127.0.0.1',
        eventType: 'login-success',
        userAgent: 'User Agent',
        country: null,
      },{
        time: new Date(1),
        ip: '127.0.0.1',
        eventType: 'login-failed-inactive',
        userAgent: 'User, Agent',
        country: 'ca',
      },{
        time: new Date(2),
        ip: '127.0.0.1',
        eventType: 'change-password-success',
        userAgent: 'User Agent"',
        country: 'ca',
      }
    ];
    const expected = `time,eventType,ip,userAgent,country
1970-01-01T00:00:00.000Z,login-success,127.0.0.1,User Agent,
1970-01-01T00:00:00.001Z,login-failed-inactive,127.0.0.1,"User, Agent",ca
1970-01-01T00:00:00.002Z,change-password-success,127.0.0.1,"User Agent""",ca
`;

    expect(csv(log)).to.equal(expected);
  });
});
