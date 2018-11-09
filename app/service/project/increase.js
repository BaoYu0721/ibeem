'use strict';

const Service = require('egg').Service;

class IncreaseService extends Service {
    async projectIncrease(userId, projectName, describe, image){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:project:add";
        var ttl = 1000;

        return redlock.lock(resource, ttl).then(function(lock) {
            async function transation() {
                const conn = await app.mysql.beginTransaction();
                try {
                    const projectCount = await conn.query('select count(id) from project where name = ?', [projectName]);
                    if(projectCount[0]['count(id)'] != 0){
                        return -2;
                    }
                    const result = await conn.insert('project', {name: projectName, des: describe, created_on: new Date(), creator_id: userId, image: image});
                    await conn.commit();
                } catch (error) {
                    conn.rollback();
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

module.exports = IncreaseService;