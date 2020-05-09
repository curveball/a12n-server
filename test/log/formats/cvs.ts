import { expect } from 'chai';

import { EventType } from '../../../src/log/types'
import csv from '../../../src/log/formats/csv'

describe('csv', () => {
    it('should return formatted log string', () => {
        const log = [
            {
            time: new Date(0),
            ip: '127.0.0.1',
            eventType: EventType.loginSuccess,
            userAgent: 'User Agent'
          },{
            time: new Date(1),
            ip: '127.0.0.1',
            eventType: EventType.loginFailed,
            userAgent: 'User, Agent'
          },
        ];
        const expected = `time,eventType,ip,userAgent
1970-01-01T00:00:00.000Z,login-success,127.0.0.1,"User Agent"
1970-01-01T00:00:00.001Z,login-failed,127.0.0.1,"User, Agent"`;

        expect(csv(log)).to.equal(expected)
    });
  });
