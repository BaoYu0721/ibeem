'use strict';

const Service = require('egg').Service;

class IncreaseService extends Service {
    async projectIncrease(userId, projectName, describe, image){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:project";
        var ttl = 2000;
        var projectCount = null;
        try {
            projectCount = await app.mysql.query('select count(id) from project where name = ?', [projectName]);
        } catch (error) {
            return -1;
        }
        if(projectCount[0]['count(id)'] != 0){
            return -2;
        }
        try {
            const res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await app.mysql.insert('project', {name: projectName, des: describe, created_on: new Date(), creator_id: userId, image: image});
                    } catch (error) {
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

module.exports = IncreaseService;