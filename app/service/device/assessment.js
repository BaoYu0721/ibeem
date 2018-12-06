'use strict';

const Service = require('egg').Service;

class AssessmentService extends Service {
    async index(deviceId){
        var assessment = null;
        try {
            assessment = await this.app.mysql.get('assessment', {device_id: deviceId});
        } catch (error) {
            return -1;
        }
        if(assessment == null){
            return null;
        }
        return assessment.content;
    }

    async save(deviceId, content){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:assessment";
        var ttl = 1000;

        try {
            const res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    var assessment = null;
                    try {
                        assessment = await app.mysql.get('assessment', {device_id: deviceId});
                    } catch (error) {
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return -1;
                    }
                    if(assessment == null){
                        try {
                            const result = await app.mysql.insert('assessment', {device_id: deviceId, content: content});
                            if(result.affectedRows != 1){
                                lock.unlock()
                                .catch(function(err) {
                                    console.error(err);
                                });
                                return -1;
                            }
                        } catch (error) {
                            lock.unlock()
                            .catch(function(err) {
                                console.error(err);
                            });
                            return -1;
                        }
                    }else{
                        try {
                            const result = await app.mysql.update('assessment', {id: assessment.id, device_id: deviceId, content: content});
                            if(result.affectedRows != 1){
                                lock.unlock()
                                .catch(function(err) {
                                    console.error(err);
                                });
                                return -1;
                            }
                        } catch (error) {
                            lock.unlock()
                            .catch(function(err) {
                                console.error(err);
                            });
                            return -1;
                        }
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

module.exports = AssessmentService;