'use strict';

const Service = require('egg').Service;

class LibraryService extends Service {
    async libraryAdd(data){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:question_bank:add";
        var ttl = 1000;

        return redlock.lock(resource, ttl).then(function(lock) {
            async function transation() {
                try {
                    await app.mysql.insert('question_bank', {
                        setting: data.setting,
                        name: data.name,
                        type: data.type,
                        html: data.html
                    });
                } catch (error) {
                    console.log(error);
                    lock.unlock();
                    return -1;
                }
                lock.unlock();
                return 0;
            }
            return transation();
        });
    }
}

module.exports = LibraryService;