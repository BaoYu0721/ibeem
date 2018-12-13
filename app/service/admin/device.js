'use strict';

const Service = require('egg').Service;

class DeviceService extends Service {
    async deviceList(page, pageSize){
        var device = null;
        try {
            device = await this.app.mysql.query('select * from device order by id desc');
        } catch (error) {
            return -1;
        }
        const deviceList = [];
        function addDeviceMap(dataCount, pname, gname, cname, bname, ownerName, id, deviceName, latitude, longitude, type, address, Online_status, warning_sign, des, memo) {
            const deviceMap = {
                dataCount: dataCount,
                pname: pname == null? '': pname,
                gname: gname == null? '': gname,
                cname: cname,
                bname: bname,
                ownerName: ownerName,
                id: id,
                name: deviceName,
                latitude: latitude,
                longitude: longitude,
                type: type,
                address: address,
                status: Online_status,
                waining: warning_sign,
                description: des,
                memo: memo
            };
            deviceList.push(deviceMap);
        }
        if(device.length > (page - 1) * pageSize && device.length >= page * pageSize){
            for(var i = (page - 1) * pageSize; i < page * pageSize; ++i){
                var dataCount = null;
                try {
                    dataCount = await this.app.mysql.query('select count(id) from device_data where device_id = ?', [device[i].id]);
                } catch (error) {
                    console.log(error);
                    return -1;
                }
                addDeviceMap(dataCount[0]['count(id)'], device[i].pname, device[i].gname, device[i].cname, device[i].bname, device[i].uname, device[i].id, device[i].name, device[i].latitude, 
                    device[i].longitude, device[i].type, device[i].address, device[i].Online_status, device[i].warning_sign, device[i].des, device[i].memo);
            }
        }else if(device.length > (page - 1) * pageSize && device.length < page * pageSize){
            for(var i = (page - 1) * pageSize; i < device.length; ++i){
                var dataCount = null;
                try {
                    dataCount = await this.app.mysql.query('select count(id) from device_data where device_id = ?', [device[i].id]);
                } catch (error) {
                    return -1;
                }
                addDeviceMap(dataCount[0]['count(id)'], device[i].pname, device[i].gname, device[i].cname, device[i].bname, device[i].uname, device[i].id, device[i].name, device[i].latitude, 
                    device[i].longitude, device[i].type, device[i].address, device[i].Online_status, device[i].warning_sign, device[i].des, device[i].memo);
            }
        }
        var deviceData = {
            list: deviceList,
            pageNo: page,
            amount: device.length,
            maxPage: Math.floor(device.length / pageSize) + 1,
            pageSize: pageSize
        };
        return deviceData;
    }

    async deviceDownloadHistory(){
        var result = null;
        try {
            result = await this.app.mysql.query('select * from work_order order by id desc');
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in result){
            const resultMap = {
              id: result[key].id,
              status: result[key].status,
              url: result[key].url,
              workid: result[key].work_id,
              deviceName: result[key].device_name,
              startTime: this.ctx.helper.dateFormat(result[key].start_time),
              endTime: this.ctx.helper.dateFormat(result[key].end_time),
              time: this.ctx.helper.dateFormat(result[key].time),
              percent: result[key].percent,
              estimateTime: result[key].estimate_time
            };
            resultList.push(resultMap);
        }
        return resultList;
    }

    async deviceOnLineRate(sTime, eTime, deviceId){
        var onlineRecord = null;
        var device = null;
        sTime += " 00:00:00";
        eTime += " 24:00:00"; 
        try {
            onlineRecord = await this.app.mysql.query('select * from online_record where device_id = ? and time >= ? and time <= ?', [deviceId, sTime, eTime]);
            device = await this.app.mysql.get('device', {id: deviceId});
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in onlineRecord){
            const resultMap = {
                time: onlineRecord[key].time.getTime(),
                onlineRecord: Math.round(onlineRecord[key].number / 288, 2)
            };
            resultList.push(resultMap);
        }
        const res = {
            data: resultList,
            device: device
        };
        return res;
    }

    async deviceEnvironment(deviceId, sTime, eTime, sWorkTime, eWorkTime, workDay){
        var device = null;
        try {
            device = await this.app.mysql.get('device', {id: deviceId});
        } catch (error) {
            return -1;
        }
        if(device == null){
            return null;
        }
        const daviceDataList = [];
        const resultList = [];
        const sTimeHours = sWorkTime.split(':')[0];
        const sTimeMinutes = sWorkTime.split(':')[1];
        const eTimeHours = eWorkTime.split(':')[0];
        const eTimeMinutes = eWorkTime.split(':')[1];
        const dayTime = 24 * 60 * 60;
        if(device.type == "coclean"){
            sTime = parseInt(sTime);
            eTime = parseInt(eTime);
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
            for(var key in resultList){
                const isWorkDay = new Date(resultList[key].time).getDay() == 6 || new Date(resultList[key].time).getDay() == 7 ? 0: 1;
                if(workDay && isWorkDay || !workDay && !isWorkDay){
                    const deviceDataHours = new Date(parseInt(resultList[key].time)).getHours();
                    const deviceDataMinutes = new Date(parseInt(resultList[key].time)).getMinutes();
                    if(deviceDataHours > sTimeHours && deviceDataHours < eTimeHours || deviceDataHours == sTimeHours && deviceDataMinutes > sTimeMinutes || deviceDataHours == eTimeHours && deviceDataMinutes < eTimeMinutes){
                        daviceDataList.push(resultList[key]);
                    }
                }
            }
        }else if(device.type == "ibeem"){
            const param = "q=" + deviceId + "&s=" + this.ctx.helper.dateFormat(new Date(sTime * 1000)) + "&e=" + this.ctx.helper.dateFormat(new Date(eTime * 1000));
            const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceData, param);
            for(var key in result.data){
                for(var i in result.data[key].dev_data){
                    const resultMap = {
                        tem: result.data[key].dev_data[i].wd,
                        hum: result.data[key].dev_data[i].sd,
                        pm:  result.data[key].dev_data[i].pm25,
                        co2: result.data[key].dev_data[i].co2,
                        lightIntensity: result.data[key].dev_data[i].zd,
                        time: parseInt(result.data[key].dev_data[i].time)
                    }
                    resultList.push(resultMap);
                }
            }
        }
        const resData = {
            deviceData: daviceDataList,
            deviceName: device.name
        };
        return resData;
    }

    async deviceAdd(data){
        const { app, ctx } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:device";
        var ttl = 1000;
        try {
            const res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        const result = await app.mysql.insert('device', {
                            created_on: new Date(),
                            updated_on: new Date(),
                            name: data.name,
                            type: data.type,
                            physical_id: data.physicalId,
                            latitude:  40.014392,
                            longitude: 116.33261,
                            address: '',
                            Online_status: 'false',
                            bname: '',
                            cname: '',
                            gname: '',
                            pname: '',
                            uname: '',
                            owner_id: 24
                        });
                        const qrCode = ctx.helper.qrcode(result.insertId);
                        if(result.insertId){
                            await app.mysql.update('device', {
                                id: result.insertId,
                                QR_code: qrCode
                            });
                        }
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return result.insertId;;
                    } catch (error) {
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return -1;
                    }
                }
                return transation();
            });
            return res;
        } catch (error) {
            console.log(error);
            return -1;
        }
    }

    async deviceUserList(){
        var users = null;
        try {
            users = await this.app.mysql.query('select id, name from user');
        } catch (error) {
            return -1;
        }
        return users;
    }

    async deviceSetOwner(userId, deviceId){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:device";
        var ttl = 1000;
        try {
            const res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        const user = await app.mysql.get('user', {id: userId});
                        if(!user){
                            lock.unlock()
                            .catch(function(err) {
                                console.error(err);
                            });
                            return -1;
                        }
                        await app.mysql.update('device', {
                            id: deviceId,
                            owner_id: user.id,
                            uname: user.name,
                            updated_on: new Date()
                        })
                    } catch (error) {
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return -1;
                    }
                }
                return transation();
            });
            return res;
        }
        catch (error) {
            return -1;
        }
    }

    async deviceDelOwner(deviceId){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        var ttl = 1000;
        try {
            const conn = await app.mysql.beginTransaction();
            var resource = "ibeem_test:device";
            var res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.update('device', {
                            id: deviceId,
                            owner_id: null,
                            uname: '',
                            project_id: null,
                            updated_on: new Date()
                        })
                    } catch (error) {
                        console.log(error)
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
            resource = "ibeem_test:device_attention";
            res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('device_attention', {
                            device_id: deviceId
                        });
                    } catch (error) {
                        console.log(error)
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
            res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.query('update building_point set device_id = ? where device_id = ?', [null, deviceId]);
                    } catch (error) {
                        console.log(error)
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
            await conn.commit();
            return res;
        }
        catch (error) {
            return -1;
        }
    }

    async deviceStatus(deviceId){
        var device = null;
        var status = false;
        try {
            device = await this.app.mysql.get('device', {id: deviceId});
        } catch (error) {
            return -1;
        }
        if(device != null){
            if(device.type == 'coclean'){
                var param = {
                    deviceId: deviceId
                };
                const result = await this.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.deviceIsOnline, param);
                if(result.result == 'success'){
                    if(result.data == 1){
                        status = true;
                    }
                }
            }else if(device.type == 'ibeem'){
                const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceOnlineStatus, deviceId);
                if(result.status == 1){
                    status = true;
                }
            }
        }
        try {
            await this.app.mysql.update('device', {id: deviceId, Online_status: status});
        } catch (error) {
            return -1;
        }
        return status;
    }
}

module.exports = DeviceService;