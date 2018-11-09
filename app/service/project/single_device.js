'use strict';

const Service = require('egg').Service;

class SingleDeviceService extends Service {
    async deviceSearch(userId){
        var device = null;
        try {
            device = await this.app.mysql.query('select id, name from device where owner_id = ? and project_id is null or owner_id = 24 and project_id is null', [userId]);
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
        const resource = "ibeem_test:device:update";
        var ttl = 1000;

        return redlock.lock(resource, ttl).then(function(lock) {
            async function transation() {
                const conn = await app.mysql.beginTransaction();
                try {
                    const project = await conn.get('project', {id: projectId});
                    for(var key in ids){
                        await conn.update('device', {id: ids[key], project_id: projectId, pname: project.name});
                    }
                    conn.commit();
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

    async deviceRecycle(userId, ids){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:device:recycle";
        var ttl = 1000;

        return redlock.lock(resource, ttl).then(function(lock) {
            async function transation() {
                const conn = await app.mysql.beginTransaction();
                try {
                    for(var key in ids){
                        await conn.update('device', {id: ids[key], project_id: null, owner_id: null, pname: null, gname: null});
                        await conn.delete('device_attention', {device_id: ids[key], user_id: userId});
                    }
                    conn.commit();
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

    async deviceAttention(projectId){
        var userProject = null;
        try {
            userProject = await this.app.mysql.select('user_project', {project_id: projectId, role: 2});
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in userProject){
            const user = null;
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

    async deviceRelieve(ids){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:device:recycle";
        var ttl = 1000;

        return redlock.lock(resource, ttl).then(function(lock) {
            async function transation() {
                try {
                    for(var key in ids){
                        await app.mysql.delete('device_attention', {device_id: ids[key]});
                    }
                } catch (error) {
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

module.exports = SingleDeviceService;