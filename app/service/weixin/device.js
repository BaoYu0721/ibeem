'use strict';

const Service = require('egg').Service;

class DeviceService extends Service {
    async deviceList(userId){
        var devices = null;
        try {
            if(userId == 24){
                devices = await this.app.mysql.select('device');
            }else{
                devices = await this.app.mysql.query('select * from device where owner_id = ? or id in(select device_id from device_attention where user_id = ?) or project_id in(select project_id from user_project where role = 1 and user_id = ?) or project_id in(select id from project where creator_id = ?)', [userId, userId, userId, userId]);
            }
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in devices){
            const resultMap = {
                id: devices[key].id,
                name: devices[key].name,
                address: devices[key].address,
                latitude: devices[key].latitude,
                longitude: devices[key].longitude,
                onlineStatus: devices[key].Online_status
            }
            resultList.push(resultMap);
        }
        return resultList;
    }

    async infoUpdate(data){
        const { app }  = this;
        const redlock  = this.service.utils.lock.lockInit();
        const ttl      = 1000;
        const resource = "ibeem_test:device";
        var res = await redlock.lock(resource, ttl)
        .then(async function(lock){
            await app.mysql.update('device', {
                id:           data.id,
                longitude:    data.longitude,
                address:      data.address,
                des:          data.describe,
                warning_sign: data.warning_sign,
                image:        data.image,
                memo:         data.memo
            });
            lock.unlock()
            .catch(function(err){
                console.log(err)
            });
        })
        .catch(function(err){
            console.log(err);
            return -1;
        });
        if(res == -1) return -1;
        return 0;
    }

    async deviceRealtimeData(deviceId){
        var device = null;
        try {
            device = await this.app.mysql.get('device', {id: deviceId})
        } catch (error) {
            return -1;
        }
        const resultMap = {};
        if(device.type == 'ibeem'){
            const param = "q=" + device.deviceid;
            const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getRealtimeData, param);
            if(result == -1) return -1;
            if(result.data.length){
                resultMap.tem = result.data[0].wd,
                resultMap.hum = result.data[0].sd,
                resultMap.pm = result.data[0].pm25,
                resultMap.co2 = result.data[0].co2,
                resultMap.lightIntensity = result.data[0].zd
            }
        }else if(device.type == 'coclean'){
            var param = {
                deviceId: deviceId
            };
            const result = await this.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.readDeviceRealtimeDataUrl, param);
            if(result == -1) return -1;
            if(result.result == 'success'){
                const arr = result.data.split(',');
                resultMap.tem = parseFloat(arr[1]),
                resultMap.hum = parseFloat(arr[2]),
                resultMap.pm = parseFloat(arr[3]),
                resultMap.co2 = parseFloat(arr[4]),
                resultMap.lightIntensity = parseFloat(arr[5])
            }
        }
        if(JSON.stringify(resultMap) == "{}"){
            resultMap.tem = 0.0,
            resultMap.hum = 0.0,
            resultMap.pm = 0.0,
            resultMap.co2 = 0.0,
            resultMap.lightIntensity = 0.0
        }
        return resultMap;
    }

    async deviceDetail(deviceId){
        var device = null;
        try {
            device = await this.app.mysql.get('device', {id: deviceId});
        } catch (error) {
            return -1;
        }
        if(device){
            const deviceMap = {
                name: device.name,
                describe: device.des,
                memo: device.memo,
                address: device.address,
                latitude: device.latitude,
                longitude: device.longitude,
                imageList: device.image != null? device.image.split(','): [],
                warning: device.warning_sign
            }
            return deviceMap;
        }
        return null;
    }

    async deviceHistory(deviceId, sTime, eTime){
        var device = null;
        try {
            device = await this.app.mysql.get('device', {id: deviceId});
        } catch (error) {
            return -1;
        }
        const resultList = [];
        if(device){
            if(device.type == "ibeem"){
                const param = "q=" + device.deviceid + "&s=" + this.ctx.helper.dateFormat(new Date(sTime * 1000)) + "&e=" + this.ctx.helper.dateFormat(new Date(eTime * 1000));
                const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceData, param);
                if(result != -1){
                    for(var key in result.data){
                        for(var i in result.data[key].dev_data){
                            const resultMap = {
                                tem: result.data[key].dev_data[i].wd,
                                hum: result.data[key].dev_data[i].sd,
                                pm:  result.data[key].dev_data[i].pm25,
                                co2: result.data[key].dev_data[i].co2,
                                lightIntensity: result.data[key].dev_data[i].zd,
                                time: new Date(result.data[key].dev_data[i].cur_time).getTime()
                            }
                            resultList.push(resultMap);
                        }
                    }
                }
            }else if(device.type == "coclean"){
                sTime = parseInt(sTime);
                eTime = parseInt(eTime);
                const dayTime = 24 * 60 * 60;
                while(sTime < eTime){
                    var tempTime = sTime + dayTime;
                    if(tempTime > eTime){
                        tempTime = eTime;
                    }
                    const param = {
                        startTime: sTime,
                        endTime: tempTime,
                        deviceId: deviceId,
                        page: 1,
                        pageSize: 1440
                    };
                    const result = await this.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.readDeviceDataUrl, param);
                    if(result == -1){
                        sTime += dayTime;
                        continue;
                    }
                    if(result.result == 'success'){
                        for(var key in result.data){
                            const dataMap = {
                                time: parseInt(result.data[key].time),
                                tem: result.data[key].d1,
                                hum: result.data[key].d2,
                                pm: result.data[key].d3,
                                co2: result.data[key].d4,
                                lightIntensity: result.data[key].d5
                            };
                            resultList.push(dataMap);
                        }
                    }
                    sTime += dayTime;
                }
            }
            return {
                data: resultList,
                deviceName: device.name
            };
        }else{
            return null;
        }
    }

    async deviceEvaluation(deviceId){
        var assessment = null;
        try {
            assessment = await this.app.mysql.get('assessment', {device_id: deviceId});
        } catch (error) {
            return -1;
        }
        if(!assessment){
            return null;
        }
        return assessment.content;
    }

    async deviceAddAttention(userId, deviceId){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        var ttl = 1000;
        var device = null;
        try {
            device = await this.app.mysql.get('device', {id: deviceId});
        } catch (error) {
            return -1;
        }
        if(!device.project_id){
            return 1;
        }
        var deviceAttention = null;
        try {
            deviceAttention = await this.app.mysql.get('device_attention',{
                user_id: userId,
                device_id: deviceId
            });
        } catch (error) {
            return -1;
        }
        if(deviceAttention){
            return 2;
        }
        var project = null;
        try {
            project = await this.app.mysql.query('select id from project where creator_id = ? or id in(select project_id from user_project where user_id = ?)', [userId, userId]);
        } catch (error) {
            return -1;
        }
        for(var key in project){
            if(project[key].id == device.project_id){
                var resource = "ibeem_test:device_attention";
                const conn = await app.mysql.beginTransaction();
                var res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            await conn.insert('device_attention', {
                                user_id: userId,
                                device_id: deviceId,
                                created_on: new Date(),
                                updated_on: new Date()
                            });
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
                    }
                    return transation();
                });
                if(res == -1) return -1;
                resource = "ibeem_test:device";
                res = await redlock.lock(resource, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            const deviceAttentionList = await conn.select('device_attention', {where: {device_id: deviceId}});
                            var gname = '';
                            for(var i in deviceAttentionList){
                                const user = await conn.get('user', {id: deviceAttentionList[i].user_id});
                                if(i == deviceAttentionList.length - 1){
                                    gname += user.name;
                                }else{
                                    gname += user.name + ',';
                                }
                            }
                            await conn.update('device',{
                                id: deviceId,
                                gname: gname,
                                updated_on: new Date()
                            });
                            await conn.commit();
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
                    }
                    return transation();
                });
                if(res == -1) return -1;
                return 3;
            }
        }
        return 1;
    }

    async qrcodeLogin(did){
        try {
            const device = await this.app.mysql.query('select id, name from device where id = ?', [did]);
            const deviceMap = {
                id: device[0].id,
                name: device[0].name
            };
            return deviceMap;
        } catch (error) {
            return -1;
        }
    }
}

module.exports = DeviceService;
