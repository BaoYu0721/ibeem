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
              url: result[key].path,
              workid: result[key].id,
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

    async createWorkOrder(deviceIds, sTime, eTime, d1, d2, d3, d4, d5, workDay, startWorkTime, endWorkTime, step){
        const { app } = this;
        var deviceName = '';
        var deviceid = '';
        var isIbeem = false;
        var isCoclean = false;
        var cocleanPhysicalId = [];
        for(var key in deviceIds){
            var device = null;
            try {
                device = await app.mysql.get('device', {id: deviceIds[key]});
            } catch (error) {
                return -1;
            }
            if(device == null) return -1;
            if(key == deviceIds.length - 1){
                deviceName += device.name;
                if(device.type == 'ibeem'){
                    deviceid += device.deviceid;
                }
            }else{
                deviceName += device.name + ',';
                if(device.type == 'ibeem'){
                    deviceid += device.deviceid  + ',';
                }
            }
            if(device.type == 'ibeem'){
                isIbeem = true;
            }else if(device.type == 'coclean'){
                isCoclean = true;
                cocleanPhysicalId.push(device.physical_id);
            }
        }
        const workOrderMap = {
            estimate_time: -1,
            percent: 0,
            device_name: deviceName,
            user_id: 24,
            url: '',
            status: 'unfinish',
            end_time: new Date(eTime * 1000),
            start_time: new Date(sTime * 1000),
            time: new Date(),
            work_day: workDay,
            begin_work_time: startWorkTime,
            end_work_time: endWorkTime,
            step: step
        };
        var paraJson = {};
        var fields = "deviceName,timesec";
        if(d1 == 1){
            fields += ',d1';
        }
        if(d2 == 1){
            fields += ',d2';
        }
        if(d3 == 1){
            fields += ',d3';
        }
        if(d4 == 1){
            fields += ',d4';
        }
        if(d5 == 1){
            fields += ',d5'
        }
        paraJson.category = "exportData";
        const condition = {
            startTime: sTime,
            endTime: eTime,
            physicalId: cocleanPhysicalId,
            fields: fields,
        };
        paraJson.condition = condition;
        if(isIbeem && isCoclean){
            const result = await this.service.utils.http.cocleanPost(app.config.deviceDataReqUrl.coclean.createExportOrder, paraJson);
            if(result.result == 'success'){
                workOrderMap.work_id = result.data;
            }else{
                return -1;
            }
            workOrderMap.ids = deviceid;
            workOrderMap.type = 2;
        }else if(isCoclean){
            const result = await this.service.utils.http.cocleanPost(app.config.deviceDataReqUrl.coclean.createExportOrder, paraJson);
            if(result.result == 'success'){
                workOrderMap.work_id = result.data;
            }else{
                return -1;
            }
            workOrderMap.type = 0;
        }else if(isIbeem){
            workOrderMap.ids = deviceid;
            workOrderMap.type = 1;
        }
        var insertResult = null;
        try {
            insertResult = await app.mysql.insert('work_order', {
                estimate_time: workOrderMap.estimate_time,
                percent: workOrderMap.percent,
                device_name: workOrderMap.device_name,
                user_id: workOrderMap.user_id,
                url: workOrderMap.url,
                status: workOrderMap.status,
                end_time: workOrderMap.end_time,
                start_time: workOrderMap.start_time,
                time: workOrderMap.time,
                work_day: workOrderMap.work_day,
                begin_work_time: workOrderMap.begin_work_time,
                end_work_time: workOrderMap.end_work_time,
                step: workOrderMap.step,
                work_id: workOrderMap.work_id? workOrderMap.work_id: null,
                ids: workOrderMap.ids? workOrderMap.ids: '',
                type: workOrderMap.type
            });
        } catch (error) {
            return -1;
        }
        const resultMap = {
            id: insertResult.insertId,
            url: workOrderMap.url,
            status: workOrderMap.status,
            workid: workOrderMap.work_id,
            deviceName: workOrderMap.device_name,
            startTime: workOrderMap.start_time,
            endTime: workOrderMap.end_time,
            time: workOrderMap.time
        };
        return resultMap;
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
        var sTimeHours = null;
        var sTimeMinutes = null;
        var eTimeHours = null;
        var eTimeMinutes = null;
        var sTimes = null;
        var eTimes = null;
        if(sWorkTime && eWorkTime){
            sTimeHours = sWorkTime.split(':')[0];
            sTimeMinutes = sWorkTime.split(':')[1];
            eTimeHours = eWorkTime.split(':')[0];
            eTimeMinutes = eWorkTime.split(':')[1];
            sTimes = sTimeHours * 60 + sTimeMinutes;
            eTimes = eTimeHours * 60 + eTimeMinutes;
        }
        if(device.type == "coclean"){
            const dayTime = 24 * 60 * 60;
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
                        const time = new Date(dataMap.time);
                        const hours = parseInt(time.getHours());
                        const minutes = parseInt(time.getMinutes());
                        const dTimes = hours * 60 + minutes;
                        if(workDay == 0){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    daviceDataList.push(dataMap);
                                }
                            }
                        }else if(workDay == 1){
                            if(time.getDay() != 0 && time.getDay() != 6){
                                daviceDataList.push(dataMap);
                            }
                        }else if(workDay == 2){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    daviceDataList.push(dataMap);
                                }
                            }else{
                                daviceDataList.push(dataMap);
                            }
                        }else{
                            if(sWorkTime && eWorkTime){
                                daviceDataList.push(dataMap);
                            }
                        }
                    }
                }
                sTime += dayTime;
            }
        }else if(device.type == "ibeem"){
            const param = "q=" + deviceId + "&s=" + this.ctx.helper.dateFormat(new Date(sTime * 1000)) + "&e=" + this.ctx.helper.dateFormat(new Date(eTime * 1000));
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
                            time: parseInt(result.data[key].dev_data[i].time)
                        }
                        const time = new Date(resultMap.time);
                        const hours = parseInt(time.getHours());
                        const minutes = parseInt(time.getMinutes());
                        const dTimes = hours * 60 + minutes;
                        if(workDay == 0){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    daviceDataList.push(resultMap);
                                }
                            }
                        }else if(workDay == 1){
                            if(time.getDay() != 0 && time.getDay() != 6){
                                daviceDataList.push(resultMap);
                            }
                        }else if(workDay == 2){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    daviceDataList.push(resultMap);
                                }
                            }else{
                                daviceDataList.push(resultMap);
                            }
                        }
                    }
                }
            }
        }
        const resData = {
            deviceData: daviceDataList,
            deviceName: device.name
        };
        return resData;
    }

    async environmentDataAlign(data){
        var device = null;
        try {
            device = await this.app.mysql.get('device', {id: data.deviceId});
        } catch (error) {
            return -1;
        }
        if(!device) return null;
        if(sTime > eTime) return null;
        const sWorkTime = data.startWorkTime;
        const eWorkTime = data.endWorkTime;
        const isWorkDay = data.workDay;
        const sWorkHour = parseInt(sWorkTime.split(':')[0]);
        const sWorkMinute = parseInt(sWorkTime.split(':')[1]);
        const eWorkHour = parseInt(eWorkTime.split(':')[0]);
        const eWorkMinute = parseInt(eWorkTime.split(':')[1]);
        const sTimes = sWorkHour * 60 + sWorkMinute;
        const eTimes = eWorkHour * 60 + eWorkMinute;
        const resultList = [];
        const tempList = [];
        if(device.type == 'coclean'){
            var sTime = parseInt(data.startTime);
            var eTime = parseInt(data.endTime);
            const dayTime = 24 * 60 * 60;
            while(sTime < eTime){
                var tempTime = sTime + dayTime;
                if(tempTime > eTime){
                    tempTime = eTime;
                }
                const param = {
                    startTime: sTime,
                    endTime: tempTime,
                    deviceId: data.deviceId,
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
                        const time = new Date(dataMap.time);
                        const hours = parseInt(time.getHours());
                        const minutes = parseInt(time.getMinutes());
                        const dTimes = hours * 60 + minutes;
                        if(isWorkDay == 0){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    tempList.push(dataMap);
                                }
                            }
                        }else if(isWorkDay == 1){
                            if(time.getDay() != 0 && time.getDay() != 6){
                                tempList.push(dataMap);
                            }
                        }else if(isWorkDay == 2){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    tempList.push(dataMap);
                                }
                            }else{
                                tempList.push(dataMap);
                            }
                        }
                    }
                }
                sTime += dayTime;
            }
        }else if(device.type == 'ibeem'){
            const param = "q=" + device.deviceid + "&s=" + this.ctx.helper.dateFormat(new Date(data.startTime)) + "&e=" + this.ctx.helper.dateFormat(new Date(data.endTime));
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
                            time: parseInt(result.data[key].dev_data[i].time)
                        }
                        const time = new Date(resultMap.time);
                        const hours = parseInt(time.getHours());
                        const minutes = parseInt(time.getMinutes());
                        const dTimes = hours * 60 + minutes;
                        if(isWorkDay == 0){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    tempList.push(resultMap);
                                }
                            }
                        }else if(isWorkDay == 1){
                            if(time.getDay() != 0 && time.getDay() != 6){
                                tempList.push(resultMap);
                            }
                        }else if(isWorkDay == 2){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    tempList.push(resultMap);
                                }
                            }else{
                                tempList.push(resultMap);
                            }
                        }
                    }
                }
            }
        }
        const temp = [];
        for(var i = parseInt(data.startTime); i < parseInt(data.endTime); i += parseInt(data.step) * 60){
            for(var j = 0; j < tempList.length; ++j){
                if(tempList[j].time > i && tempList[j] <= i + data.step * 60){
                    if(temp[i]){
                        temp[i].tem += tempList[j].tem;
                        temp[i].hum += tempList[j].hum;
                        temp[i].pm += tempList[j].pm;
                        temp[i].co2 += tempList[j].co2;
                        temp[i].lightIntensity += tempList[j].lightIntensity;
                        temp[i].count++;
                    }else{
                        temp[i] = {
                            tem: tempList[j].tem,
                            hum: tempList[j].hum,
                            pm: tempList[j].pm,
                            co2: tempList[j].co2,
                            lightIntensity: tempList[j].lightIntensity,
                            count: 1
                        };
                    }
                }
            }
        }
        for(var i = 0; i < temp.length; ++i){
            const resultMap = {
                tem: temp[i].tmp / temp[i].count,
                hum: temp[i].hum / temp[i].count,
                pm: temp[i].pm / temp[i].count,
                co2: temp[i].co2 / temp[i].count,
                lightIntensity: temp[i].lightIntensity / temp[i].count
            }
            resultList.push(resultMap);
        }
        return {
            result: "success",
            data: resultList,
            deviceId: data.deviceId,
            deviceName: device.name
        };
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