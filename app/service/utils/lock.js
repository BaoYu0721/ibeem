'use strict';

const Service = require('egg').Service;
var Redlock = require('redlock');

class LockService extends Service {
    lockInit(){
        const redlock = new Redlock(
            [this.app.redis],
            {
                // the expected clock drift; for more details
                // see http://redis.io/topics/distlock
                driftFactor: 0.01, // time in ms
        
                // the max number of times Redlock will attempt
                // to lock a resource before erroring
                retryCount:  10,
        
                // the time in ms between attempts
                retryDelay:  200, // time in ms
        
                // the max time in ms randomly added to retries
                // to improve performance under high contention
                // see https://www.awsarchitectureblog.com/2015/03/backoff.html
                retryJitter:  200 // time in ms
            }
        )

        redlock.on('clientError', function(err) {
            console.error('A redis error has occurred:', err);
        });

        return redlock;
    }
}

module.exports = LockService;