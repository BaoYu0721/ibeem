'use strict';

const Service = require('egg').Service;

class LibraryService extends Service {
    async libraryAdd(data){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:question_bank";
        var ttl = 1000;
        try {
            const res = await redlock.lock(resource, ttl).then(function(lock) {
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
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return -1;
                    }
                    lock.unlock()
                    .catch(function(err) {
                        console.error(err);
                    });
                    return 0;
                }
                return transation();
            });
            return res;
        } catch (error) {
            return -1;
        }
    }
}

module.exports = LibraryService;