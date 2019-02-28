'use strict';

const Service = require('egg').Service;

class DeviceService extends Service {
    async deviceList(page, pageSize){
        var device = null;
        try {
            device = await this.app.mysql.query('select * from device order by id');
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
                ownerName: ownerName? ownerName: '',
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
                var user      = null;
                try {
                    dataCount = await this.app.mysql.query('select count(id) from device_data where device_id = ?', [device[i].id]);
                    user      = await this.app.mysql.get('user', device[i].owner_id);
                } catch (error) {
                    console.log(error);
                    return -1;
                }
                addDeviceMap(dataCount[0]['count(id)'], device[i].pname, device[i].gname, device[i].cname, device[i].bname, user.name, device[i].id, device[i].name, device[i].latitude, 
                    device[i].longitude, device[i].type, device[i].address, device[i].Online_status, device[i].warning_sign, device[i].des, device[i].memo);
            }
        }else if(device.length > (page - 1) * pageSize && device.length < page * pageSize){
            for(var i = (page - 1) * pageSize; i < device.length; ++i){
                var dataCount = null;
                var user      = null;
                try {
                    dataCount = await this.app.mysql.query('select count(id) from device_data where device_id = ?', [device[i].id]);
                    user      = await this.app.mysql.get('user', device[i].owner_id);
                } catch (error) {
                    return -1;
                }
                addDeviceMap(dataCount[0]['count(id)'], device[i].pname, device[i].gname, device[i].cname, device[i].bname, user.name, device[i].id, device[i].name, device[i].latitude, 
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

    async deviceResearch(str){
        const sqlStr = '%' + str + '%';
        const deviceList = [];
        try {
            const device = await this.app.mysql.query('select * from device where name like ? or type like ? or uname like ? or address like ?', [sqlStr.toUpperCase(), sqlStr.toLowerCase(), sqlStr, sqlStr]);
            for(var key in device){
                const user = await this.app.mysql.get('user', { id: device[key].owner_id });
                const data_count = await this.app.mysql.query('select count(id) from device_data where device_id = ?', [device[key].id]);
                const deviceMap = {
                    pname: device[key].pname == null? '': device[key].pname,
                    gname: device[key].gname == null? '': device[key].gname,
                    cname: device[key].cname == null? '': device[key].cname,
                    bname: device[key].bname == null? '': device[key].bname,
                    ownerName: user?user.name == null? '': user.name: '',
                    id: device[key].id,
                    deviceName: device[key].name == null? '': device[key].name,
                    userName: device[key].uname ? device[key].uname : '',
                    latitude: device[key].latitude == null? '': device[key].latitude,
                    longitude: device[key].longitude == null? '': device[key].longitude,
                    type: device[key].type == null? '': device[key].type,
                    address: device[key].address == null? '': device[key].address,
                    status: device[key].Online_status == null? '': device[key].Online_status,
                    waining: device[key].warning_sign == null? '': device[key].warning_sign,
                    description: device[key].des == null? '': device[key].des,
                    memo: device[key].memo == null? '': device[key].memo,
                    dataCount: data_count[0]['count(id)']
                };
                deviceList.push(deviceMap);
            }
        } catch (error) {
            console.log(error)
            return -1;
        }
        return deviceList;
    }

    async deviceExport(data){
        const { ctx, app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:device";
        var ttl = 1000;
        await redlock.lock(resource, ttl)
        .then(async function(lock){
            for(var i = 1; i < data.length; ++i){
                const did     = data[i][0];
                const name    = data[i][1];
                const mac     = data[i][2];
                const type    = data[i][3];
                const address = data[i][4];
                const qcode   = ctx.helper.qrcode(did);
                await app.mysql.insert('device', {
                    deviceid:    did,
                    name:        name,
                    physical_id: mac,
                    type:        type,
                    address:     address,
                    QR_code:     qcode,
                    longitude:   116.33261,
                    latitude:    40.014392,
                    owner_id:    24,
                    created_on:  new Date(),
                    updated_on:  new Date()
                });
            }
            lock.unlock()
            .catch(function(err){
                console.log(err)
            })
        })
        .catch(function(err){
            console.log(err);
            return -1;
        });
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
            console.log(error);
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
        var sTimeHours = parseInt(sWorkTime.split(':')[0]);
        var sTimeMinutes = parseInt(sWorkTime.split(':')[1]);
        var eTimeHours = parseInt(eWorkTime.split(':')[0]);
        var eTimeMinutes = parseInt(eWorkTime.split(':')[1]);
        var sTimes = sTimeHours * 60 + sTimeMinutes;
        var eTimes = eTimeHours * 60 + eTimeMinutes;
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
                            tem: parseFloat(result.data[key].d1),
                            hum: parseFloat(result.data[key].d2),
                            pm: parseFloat(result.data[key].d3),
                            co2: parseFloat(result.data[key].d4),
                            lightIntensity: parseFloat(result.data[key].d5)
                        };
                        const time = new Date(dataMap.time);
                        const hours = parseInt(time.getHours());
                        const minutes = parseInt(time.getMinutes());
                        const dTimes = hours * 60 + minutes;
                        if(workDay == 0){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                daviceDataList.push(dataMap);
                            }
                        }else if(workDay == 1){
                            if(time.getDay() != 0 && time.getDay() != 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    daviceDataList.push(dataMap);
                                }
                            }
                        }else if(workDay == 2){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                daviceDataList.push(dataMap);
                            }else{
                                if(dTimes > sTimes && dTimes < eTimes){
                                    daviceDataList.push(dataMap);
                                }
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
                            tem: parseFloat(result.data[key].dev_data[i].wd),
                            hum: parseFloat(result.data[key].dev_data[i].sd),
                            pm:  parseFloat(result.data[key].dev_data[i].pm25),
                            co2: parseFloat(result.data[key].dev_data[i].co2),
                            lightIntensity: parseFloat(result.data[key].dev_data[i].zd),
                            time: parseInt(result.data[key].dev_data[i].time)
                        }
                        const time = new Date(resultMap.time);
                        const hours = parseInt(time.getHours());
                        const minutes = parseInt(time.getMinutes());
                        const dTimes = hours * 60 + minutes;
                        if(workDay == 0){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                daviceDataList.push(resultMap);
                            }
                        }else if(workDay == 1){
                            if(time.getDay() != 0 && time.getDay() != 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    daviceDataList.push(resultMap);
                                }
                            }
                        }else if(workDay == 2){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                daviceDataList.push(resultMap);
                            }else{
                                if(dTimes > sTimes && dTimes < eTimes){
                                    daviceDataList.push(resultMap);
                                }
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

    async environmentDataAlign(deviceId, sTime, eTime, sWorkTime, eWorkTime, workDay, step){
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
        var sTimeHours = parseInt(sWorkTime.split(':')[0]);
        var sTimeMinutes = parseInt(sWorkTime.split(':')[1]);
        var eTimeHours = parseInt(eWorkTime.split(':')[0]);
        var eTimeMinutes = parseInt(eWorkTime.split(':')[1]);
        var sTimes = sTimeHours * 60 + sTimeMinutes;
        var eTimes = eTimeHours * 60 + eTimeMinutes;
        var sTimeBuf = sTime;
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
                                daviceDataList.push(dataMap);
                            }
                        }else if(workDay == 1){
                            if(time.getDay() != 0 && time.getDay() != 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    daviceDataList.push(dataMap);
                                }
                            }
                        }else if(workDay == 2){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                daviceDataList.push(dataMap);
                            }else{
                                if(dTimes > sTimes && dTimes < eTimes){
                                    daviceDataList.push(dataMap);
                                }
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
                                daviceDataList.push(resultMap);
                            }
                        }else if(workDay == 1){
                            if(time.getDay() != 0 && time.getDay() != 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    daviceDataList.push(resultMap);
                                }
                            }
                        }else if(workDay == 2){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                daviceDataList.push(resultMap);
                            }else{
                                if(dTimes > sTimes && dTimes < eTimes){
                                    daviceDataList.push(resultMap);
                                }
                            }
                        }
                    }
                }
            }
        }
        const resultList = [];
        for(var i = parseInt(sTimeBuf); i < parseInt(eTime); i += parseInt(step) * 60){
            var temp = null;
            for(var j = 0; j < daviceDataList.length; ++j){
                if(daviceDataList[j].time > i * 1000 && daviceDataList[j].time <= (i + step * 60) * 1000){
                    if(temp){
                        temp.tem += parseFloat(daviceDataList[j].tem),
                        temp.hum += parseFloat(daviceDataList[j].hum),
                        temp.pm += parseFloat(daviceDataList[j].pm),
                        temp.co2 += parseFloat(daviceDataList[j].co2),
                        temp.lightIntensity += parseFloat(daviceDataList[j].lightIntensity),
                        temp.count++;
                    }else{
                        temp = {
                            tem: parseFloat(daviceDataList[j].tem),
                            hum: parseFloat(daviceDataList[j].hum),
                            pm: parseFloat(daviceDataList[j].pm),
                            co2: parseFloat(daviceDataList[j].co2),
                            lightIntensity: parseFloat(daviceDataList[j].lightIntensity),
                            count: 1
                        };
                    }
                }
            }
            if(temp){
                const resultMap = {
                    tem: (temp.tem / temp.count).toFixed(2),
                    hum: (temp.hum / temp.count).toFixed(2),
                    pm: (temp.pm / temp.count).toFixed(2),
                    co2: (temp.co2 / temp.count).toFixed(2),
                    time: i * 1000,
                    lightIntensity: (temp.lightIntensity / temp.count).toFixed(2)
                }
                resultList.push(resultMap);
            }
        }
        return {
            result: "success",
            data: resultList,
            deviceId: deviceId,
            deviceName: device.name
        };
    }

    async deviceAdd(data){
        const { app, ctx } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:device";
        var ttl = 1000;
        console.log(data)
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
                            deviceid: data.deviceid,
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