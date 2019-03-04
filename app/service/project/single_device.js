'use strict';

const Service = require('egg').Service;

class SingleDeviceService extends Service {
    async deviceSearch(userId){
        var device = null;
        try {
            device = await this.app.mysql.query('select id, name from device where (owner_id = ? and project_id is null) or (owner_id = 24 and project_id is null)', [userId]);
        } catch (error) {
            return -1;
        }
        const deviceList = [];
        for(var key in device){
            const deviceMap = {
                name: device[key].name,
                id: device[key].id
            };
            deviceList.push(deviceMap);
        }
        return deviceList;
    }

    async deviceAdd(projectId, ids){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:device";
        var ttl = 1000;
        try {
            const res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    const conn = await app.mysql.beginTransaction();
                    try {
                        const project = await app.mysql.get('project', {id: projectId});
                        for(var key in ids){
                            await conn.update('device', {id: ids[key], project_id: projectId, pname: project.name});
                        }
                        conn.commit();
                    } catch (error) {
                        conn.rollback();
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

    async deviceRecycle(userId, ids){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const conn = await app.mysql.beginTransaction();
        var ttl = 1000;
        try {
            var resource = "ibeem_test:device";
            var res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        for(var key in ids){
                            await conn.update('device', {id: ids[key], project_id: null, building_id: null, bname: null, cname: null, owner_id: 24, pname: null, gname: null});
                        }
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            resource = "ibeem_test:building_point";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        for(var key in ids){
                            await conn.query('update building_point set device_id = ? where device_id = ?', [null, ids[key]]);
                        }
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            var resource = "ibeem_test:device_attention";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        for(var key in ids){
                            await conn.delete('device_attention', {device_id: ids[key], user_id: userId});
                        }
                    } catch (error) {
                        conn.rollback();
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
            if(res == -1) return res;
            await conn.commit();
            return res;
        } catch (error) {
            return -1;
        }
    }

    async deviceAttention(projectId){
        var userProject = null;
        try {
            userProject = await this.app.mysql.select('user_project', {project_id: projectId, role: 2});
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in userProject){
            var user = null;
            try {
                user = await this.app.mysql.get('user', {id: userProject[key].user_id});
            } catch (error) {
                return -1;
            }
            const resultMap = {
                id: user.id,
                name: user.name,
                portrait: user.portrait
            };
            resultList.push(resultMap);
        }
        return resultList;
    }

    async addDeviceAttention(dids, uid){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        var ttl = 1000;
        const didArr = dids.split(',');
        let i = 0;
        for(; i < didArr.length; i++){
            const conn = await app.mysql.beginTransaction();
            var resource = "ibeem_test:device_attention";
            await redlock.lock(resource, ttl)
            .then(async function(lock) {
                const res = await app.mysql.get('device_attention', {
                    device_id: didArr[i],
                    user_id: uid
                });
                if(res) return;
                await conn.insert('device_attention', {
                    device_id: didArr[i],
                    user_id: uid,
                    created_on: new Date(),
                    updated_on: new Date(),
                    deleted: 0
                });
                lock.unlock();
            })
            .catch(function(err){
                console.log(err);
                return -1;
            });
            resource = "ibeem_test:device";
            await redlock.lock(resource, ttl)
            .then(async function(lock) {
                const res = await conn.select('device_attention', {where: {
                    device_id: didArr[i]
                }});
                var gname = '';
                for(var j in res){
                    const user = await app.mysql.get('user', {id: res[j].user_id});
                    if(j == res.length - 1){
                        gname += user.name;
                    }else{
                        gname += user.name + ',';
                    }
                }
                await conn.update('device',{
                    id: didArr[i],
                    gname: gname,
                    updated_on: new Date()
                });
                await conn.commit();
                lock.unlock();
            })
            .catch(function(err){
                console.log(err);
                return -1;
            });
        }
        return 0;
    }

    async deviceRelieve(ids){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const conn = await app.mysql.beginTransaction();
        const resource = "ibeem_test:device_attention";
        var ttl = 1000;
        try {
            const res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        for(var key in ids){
                            await conn.delete('device_attention', {device_id: ids[key]});
                            await conn.update('device', {id: ids[key], gname: ''});
                        }
                        await conn.commit();
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

module.exports = SingleDeviceService;