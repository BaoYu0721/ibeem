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
            var device;
            if(str == "在线" || str == "不在线" || str.toLowerCase() == "not online" || str.toLowerCase() == "online"){
                if(str == "在线" || str.toLowerCase() == "online")
                    device = await this.app.mysql.query('select * from device where Online_status = 1');
                else
                    device = await this.app.mysql.query('select * from device where Online_status = 0');
            }
            else{
                device = await this.app.mysql.query('select * from device where name like ? or type like ? or uname like ? or address like ? or pname like ? or bname like ? or gname like ? or cname like ? or memo like ?', [sqlStr.toUpperCase(), sqlStr.toLowerCase(), sqlStr, sqlStr, sqlStr, sqlStr, sqlStr, sqlStr, sqlStr]);
            }
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
                    dataCount: data_count[0]['count(id)'],
                    status: device[key].Online_status
                };
                deviceList.push(deviceMap);
            }
        } catch (error) {
            console.log(error)
            return -1;
        }
        return deviceList;
    }

    async deviceImport(data){
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

    async coclean(workOrder){
        const json = {
            category: 'exportData',
            orderId: workOrder.work_id.toString()
        }
        var result = await this.ctx.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.statusWorkOrder, json);
        if(result == -1){
            return -1;
        }
        var dataList       = [];
        var deviceDataList = [];
        var url            = null; 
        if(result.result == 'success'){
            const sTime       = new Date(workOrder.start_time).getTime() / 1000;
            const eTime       = new Date(workOrder.end_time).getTime() / 1000;
            const sWorkTime   = workOrder.begin_work_time;
            const eWorkTime   = workOrder.end_work_time;
            const isWorkDay   = workOrder.work_day;
            const sWorkHour   = parseInt(sWorkTime.split(':')[0]);
            const sWorkMinute = parseInt(sWorkTime.split(':')[1]);
            const eWorkHour   = parseInt(eWorkTime.split(':')[0]);
            const eWorkMinute = parseInt(eWorkTime.split(':')[1]);
            if(result.data[0].status == 'finish'){
                url = result.data[0].data_file;
                const data = await this.ctx.service.utils.http.urlReq(url);
                if(data == -1) return -1;
                var dataArr = data.split('\n');
                var title;
                // 往dataList push数据
                function dataListPush(dataList, title, arr){
                    if(dataList.length == 0){
                        var dataListNode = [];
                        dataListNode.push(title);
                        dataListNode.push(arr);
                        dataList.push(dataListNode);
                    }else{
                        var flag = false;
                        for(var j = 0; j < dataList.length; ++j){
                            if(arr[0] == dataList[j][1][0]){
                                flag = true;
                                dataList[j].push(arr);
                            }
                        }
                        if(!flag){
                            var dataListNode = [];
                            dataListNode.push(title);
                            dataListNode.push(arr);
                            dataList.push(dataListNode);
                        }
                    }
                }
                for(var i = 0; i < dataArr.length; ++i){
                    const arr = dataArr[i].slice(0, dataArr[i].length - 1).split(',');
                    if(i == 0){
                        title = arr;
                        continue;
                    }
                    var time;
                    if(title[1] == 'Time'){
                        time = new Date(arr[1]);
                    }else if(title[2] == 'Time'){
                        time = new Date(arr[2]);
                    }
                    if(parseInt(time.getTime() / 1000) > parseInt(sTime) && parseInt(time.getTime() / 1000) < parseInt(eTime)){
                        const hour = parseInt(time.getHours());
                        const minute = parseInt(time.getMinutes());
                        const dTimes = hour * 60 + minute;
                        const sTimes = sWorkHour * 60 + sWorkMinute;
                        const eTimes = eWorkHour * 60 + eWorkMinute;
                        if(isWorkDay == 0){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                dataListPush(dataList, title, arr);
                            }
                        }else if(isWorkDay == 1){
                            if(time.getDay() != 0 && time.getDay() != 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    dataListPush(dataList, title, arr);
                                }
                            }
                        }else if(isWorkDay == 2){
                            if(time.getDay() != 0 && time.getDay() != 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    dataListPush(dataList, title, arr);
                                }
                            }else{
                                if(dTimes > sTimes && dTimes < eTimes){
                                    dataListPush(dataList, title, arr);
                                }
                            }
                        }
                    }
                }
                var sTimeBuf = new Date(workOrder.start_time).getTime();
                var eTimeBuf = new Date(workOrder.end_time).getTime();
                for(var j = 0; j < dataList.length; ++j){
                    var dataBuf = [['ID', 'Time', 'Temp(℃)', 'RH(%)', 'Light(lux)', 'CO₂(ppm)', 'PM2.5(μm/m³)']];
                    for(var i = sTimeBuf; i < eTimeBuf; i += parseInt(workOrder.step) * 60 * 1000){
                        var temp = null;
                        for(var k = 1; k < dataList[j].length; ++k){
                            var time = new Date(dataList[j][k][1]).getTime();
                            if(time > i && time <= i + parseInt(workOrder.step) * 60 * 1000){
                                if(temp){
                                    temp.id = dataList[j][k][0];
                                    temp.tem += parseFloat(dataList[j][k][2]),
                                    temp.hum += parseFloat(dataList[j][k][3]),
                                    temp.pm += parseFloat(dataList[j][k][4]),
                                    temp.co2 += parseFloat(dataList[j][k][5]),
                                    temp.lightIntensity += parseFloat(dataList[j][k][6]),
                                    temp.count++;
                                }else{
                                    temp = {
                                        id: dataList[j][k][0],
                                        tem: parseFloat(dataList[j][k][2]),
                                        hum: parseFloat(dataList[j][k][3]),
                                        pm: parseFloat(dataList[j][k][4]),
                                        co2: parseFloat(dataList[j][k][5]),
                                        lightIntensity: parseFloat(dataList[j][k][6]),
                                        count: 1
                                    };
                                }
                            }
                        }
                        if(temp){
                            const resultArr = [
                                temp.id,
                                this.ctx.helper.dateFormat(new Date(i)),
                                isNaN(temp.tem)?'':((temp.tem / temp.count).toFixed(2)).toString(),
                                isNaN(temp.hum)?'':((temp.hum / temp.count).toFixed(2)).toString(),
                                isNaN(temp.lightIntensity)?'':((temp.lightIntensity / temp.count).toFixed(2)).toString(),
                                isNaN(temp.co2)?'':((temp.co2 / temp.count).toFixed(2)).toString(),
                                isNaN(temp.pm)?'':((temp.pm / temp.count).toFixed(2)).toString(),
                            ]
                            dataBuf.push(resultArr);
                        }
                    }
                    deviceDataList.push(dataBuf);
                }
            }
            else{
                return {status: result.data[0].status};
            }
        }
        return {
            dataList: deviceDataList,
            url     : url,
            status  : result?result.data?result.data[0].status:'':'',
            workId  : result?result.data?result.data[0].orderId:'':''
        };
    }

    async packageData(cocleanData, cocleanName, ibeemData, ibeemName){
        const flodername = parseInt(new Date().getTime() / 1000);
        const path = './tmp/' + flodername + '/';
        var cocleanNameArr;
        var ibeemNameArr;
        if(cocleanName)
            cocleanNameArr = cocleanName.split(',');
        if(ibeemName)
            ibeemNameArr   = ibeemName.split(',');
        if(!cocleanData && !ibeemData) return -1;
        if(cocleanData){
            if(this.ctx.helper.mkdirSync(path)){
                var cocleanNameBuf = [];
                if(cocleanData.length){
                    for(var i = 0; i < cocleanData.length; ++i){
                        if(cocleanData[i].length < 2) continue;
                        const filepath = path + cocleanData[i][1][0] + '.csv';
                        this.ctx.helper.xlsxWriteFile(cocleanData[i], filepath);
                        cocleanNameBuf.push(cocleanData[i][1][0]);
                    }
                }
                for(var i = 0; i < cocleanNameArr.length; ++i){
                    var flag = false;
                    for(var j = 0; j < cocleanNameBuf.length; ++j){
                        if(cocleanNameBuf[j].indexOf(cocleanNameArr[i]) != -1) flag = true;
                    }
                    if(!flag){
                        const temp = [['ID', 'Time', 'Temp(℃)', 'RH(%)', 'Light(lux)', 'CO₂(ppm)', 'PM2.5(μm/m³)']];
                        const filepath = path + cocleanNameArr[i] + '.csv';
                        this.ctx.helper.xlsxWriteFile(temp, filepath);
                    }
                }
            }
        }
        if(ibeemData){
            if(this.ctx.helper.mkdirSync(path)){
                var ibeemNameBuf = [];
                if(ibeemData.length){
                    for(var i = 0; i < ibeemData.length; ++i){
                        if(ibeemData[i].length < 2) continue;
                        const filepath = path + ibeemData[i][1][0] + '.csv';
                        this.ctx.helper.xlsxWriteFile(ibeemData[i], filepath);
                        ibeemNameBuf.push(ibeemData[i][1][0]);
                    }
                }
                for(var i = 0; i < ibeemNameArr.length; ++i){
                    var flag = false;
                    for(var j = 0; j < ibeemNameBuf.length; ++j){
                        if(ibeemNameBuf[j].indexOf(ibeemNameArr[i]) != -1) flag = true;
                    }
                    if(!flag){
                        const temp = [['ID', 'Time', 'Temp(℃)', 'RH(%)', 'Light(lux)', 'CO₂(ppm)', 'PM2.5(μm/m³)']];
                        const filepath = path + ibeemNameArr[i] + '.csv';
                        this.ctx.helper.xlsxWriteFile(temp, filepath);
                    }
                }
            }
        }
        const pathname = './app/public/file/csv/';
        this.ctx.helper.floderToZip(pathname, flodername);
        const filename = '/public/file/csv/' + flodername + '.zip';
        return filename;
    }

    async ibeem(workOrder){
        const deviceId = workOrder.ids;
        const sTime = workOrder.start_time;
        const eTime = workOrder.end_time;
        const sWorkTime = workOrder.begin_work_time;
        const eWorkTime = workOrder.end_work_time;
        const isWorkDay = workOrder.work_day;
        const sWorkHour = parseInt(sWorkTime.split(':')[0]);
        const sWorkMinute = parseInt(sWorkTime.split(':')[1]);
        const eWorkHour = parseInt(eWorkTime.split(':')[0]);
        const eWorkMinute = parseInt(eWorkTime.split(':')[1]);
        const param = "q=" + deviceId + "&s=" + this.ctx.helper.dateFormat(new Date(sTime)) + "&e=" + this.ctx.helper.dateFormat(new Date(eTime));
        const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceData, param);
        if(result == -1){
            return -1;
        }
        var dataList = [];
        for(var key in result.data){
            var device = [];
            for(var i in result.data[key].dev_data){
                var envData = [];
                envData.push(result.data[key].dev_id);
                envData.push(result.data[key].dev_data[i].cur_time);
                envData.push(result.data[key].dev_data[i].wd? result.data[key].dev_data[i].wd: '');
                envData.push(result.data[key].dev_data[i].sd? result.data[key].dev_data[i].sd: '');
                envData.push(result.data[key].dev_data[i].zd? result.data[key].dev_data[i].zd: '');
                envData.push(result.data[key].dev_data[i].co2? result.data[key].dev_data[i].co2: '');
                envData.push(result.data[key].dev_data[i].pm25? result.data[key].dev_data[i].pm25: '');
                const time = new Date(result.data[key].dev_data[i].time);
                const hours = parseInt(time.getHours());
                const minutes = parseInt(time.getMinutes());
                const dTimes = hours * 60 + minutes;
                const sTimes = sWorkHour * 60 + sWorkMinute;
                const eTimes = eWorkHour * 60 + eWorkMinute;
                if(isWorkDay == 0){
                    if(time.getDay() == 0 || time.getDay() == 6){
                        device.push(envData);
                    }
                }else if(isWorkDay == 1){
                    if(time.getDay() != 0 && time.getDay() != 6){
                        if(dTimes > sTimes && dTimes < eTimes){
                            device.push(envData);
                        }
                    }
                }else if(isWorkDay == 2){
                    if(time.getDay() == 0 || time.getDay() == 6){
                        device.push(envData);
                    }else{
                        if(dTimes > sTimes && dTimes < eTimes){
                            device.push(envData);
                        }
                    }
                }
                device.push(envData);
            }
            dataList.push(device);
        }
        var deviceDataList = [];
        var sTimeBuf = new Date(workOrder.start_time).getTime();
        var eTimeBuf = new Date(workOrder.end_time).getTime();
        for(var j = 0; j < dataList.length; ++j){
            var dataBuf = [['ID', 'Time', 'Temp(℃)', 'RH(%)', 'Light(lux)', 'CO₂(ppm)', 'PM2.5(μm/m³)']];
            for(var i = sTimeBuf; i < eTimeBuf; i += parseInt(workOrder.step) * 60 * 1000){
                var temp = null;
                for(var k = 0; k < dataList[j].length; ++k){
                    var time = new Date(dataList[j][k][1]).getTime();
                    if(time > i && time <= i + parseInt(workOrder.step) * 60 * 1000){
                        if(temp){
                            temp.id = dataList[j][k][0];
                            temp.tem += parseFloat(dataList[j][k][2]),
                            temp.hum += parseFloat(dataList[j][k][3]),
                            temp.lightIntensity += parseFloat(dataList[j][k][4]),
                            temp.co2 += parseFloat(dataList[j][k][5]),
                            temp.pm += parseFloat(dataList[j][k][6]),
                            temp.count++;
                        }else{
                            temp = {
                                id: dataList[j][k][0],
                                tem: parseFloat(dataList[j][k][2]),
                                hum: parseFloat(dataList[j][k][3]),
                                lightIntensity: parseFloat(dataList[j][k][4]),
                                co2: parseFloat(dataList[j][k][5]),
                                pm: parseFloat(dataList[j][k][6]),
                                count: 1
                            };
                        }
                    }
                }
                if(temp){
                    const resultArr = [
                        temp.id,
                        this.ctx.helper.dateFormat(new Date(i)),
                        isNaN(temp.tem)?'':((temp.tem / temp.count).toFixed(2)).toString(),
                        isNaN(temp.hum)?'':((temp.hum / temp.count).toFixed(2)).toString(),
                        isNaN(temp.lightIntensity)?'':((temp.lightIntensity / temp.count).toFixed(2)).toString(),
                        isNaN(temp.co2)?'':((temp.co2 / temp.count).toFixed(2)).toString(),
                        isNaN(temp.pm)?'':((temp.pm / temp.count).toFixed(2)).toString(),
                    ]
                    dataBuf.push(resultArr);
                }
            }
            deviceDataList.push(dataBuf);
        }
        return deviceDataList;
    }

    async createWorkOrder(deviceIds, sTime, eTime, d1, d2, d3, d4, d5, workDay, startWorkTime, endWorkTime, step){
        const { ctx, app } = this;
        var cocleanName = '';
        var ibeemName = '';
        var deviceid = '';
        var isIbeem = false;
        var isCoclean = false;
        var cocleanPhysicalId = [];
        var file_path = null;
        for(var key in deviceIds){
            var device = null;
            try {
                device = await app.mysql.get('device', {id: deviceIds[key]});
            } catch (error) {
                return -1;
            }
            if(device == null) return -1;
            if(device.type == 'ibeem'){
                isIbeem    = true;
                deviceid  += device.deviceid + ',';
                ibeemName += device.name + ',';
            }else if(device.type == 'coclean'){
                isCoclean    = true;
                cocleanName += device.name + ',';
                cocleanPhysicalId.push(device.physical_id);
            }
        }
        deviceid    = deviceid.substr(0, deviceid.lastIndexOf(','));
        ibeemName   = ibeemName.substr(0, ibeemName.lastIndexOf(','));
        cocleanName = cocleanName.substr(0, cocleanName.lastIndexOf(','));
        const workOrderMap = {
            estimate_time: -1,
            percent: 0,
            device_name: cocleanName == ''?ibeemName: cocleanName + ((ibeemName == '')? '': (',' + ibeemName)),
            user_id: 24,
            url: '',
            path: '',
            status: 'unfinish',
            end_time: new Date(eTime * 1000),
            start_time: new Date(sTime * 1000),
            time: new Date(),
            work_day: workDay,
            begin_work_time: startWorkTime,
            end_work_time: endWorkTime,
            step: step
        };
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
        const condition = {
            startTime: sTime,
            endTime: eTime,
            physicalId: cocleanPhysicalId,
            fields: fields,
        };
        var paraJson = {
            category : "exportData",
            condition: condition
        };
        if(isIbeem && isCoclean){
            const result = await this.service.utils.http.cocleanPost(app.config.deviceDataReqUrl.coclean.createExportOrder, paraJson);
            if(result.result == 'success'){
                workOrderMap.work_id = result.data;
            }else{
                return -1;
            }
            workOrderMap.ids  = deviceid;
            workOrderMap.type = 2;
            var coclean_res = await ctx.service.device.download.coclean(workOrderMap);
            if(coclean_res == -1) return -1;
            while(coclean_res.status != 'finish' && coclean_res != -1){
                coclean_res = await ctx.service.device.download.coclean(workOrderMap);
                if(coclean_res == -1) break;
                ctx.helper.sleep(1000);
            }
            const ibeem_res   = await ctx.service.device.download.ibeem(workOrderMap);
            if(coclean_res != -1 && ibeem_res != -1){
                workOrderMap.url     = coclean_res.url;
                workOrderMap.work_id = coclean_res.workId;
                file_path            = await ctx.service.device.download.packageData(coclean_res.dataList, cocleanName, ibeem_res, ibeemName);
                workOrderMap.path    = file_path; 
            }
            else{
                return -1;
            }
        }else if(isCoclean){
            const result = await this.service.utils.http.cocleanPost(app.config.deviceDataReqUrl.coclean.createExportOrder, paraJson);
            if(result.result == 'success'){
                workOrderMap.work_id = result.data;
            }else{
                return -1;
            }
            workOrderMap.type = 0;
            var coclean_res = await ctx.service.device.download.coclean(workOrderMap);
            if(coclean_res == -1) return -1;
            while(coclean_res.status != 'finish' && coclean_res != -1){
                coclean_res = await ctx.service.device.download.coclean(workOrderMap);
                if(coclean_res == -1) break;
                ctx.helper.sleep(1000);
            }
            if(coclean_res != -1){
                workOrderMap.url     = coclean_res.url;
                workOrderMap.work_id = coclean_res.workId;
                file_path            = await ctx.service.device.download.packageData(coclean_res.dataList, cocleanName, null, null);
                workOrderMap.path    = file_path; 
            }else{
                return -1;
            }
        }else if(isIbeem){
            workOrderMap.ids  = deviceid;
            workOrderMap.type = 1;
            const ibeem_res   = await this.ibeem(workOrderMap);
            if(ibeem_res != -1){
                file_path         = await this.packageData(null, null, ibeem_res, ibeemName);
                workOrderMap.path = file_path; 
            }
        }
        if(file_path && file_path != -1){
            workOrderMap.status        = 'finish';
            workOrderMap.path          = file_path;
            workOrderMap.estimate_time = 0;
            workOrderMap.percent       = 100;
        }
        try {
            await app.mysql.insert('work_order', {
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
                type: workOrderMap.type,
                path: workOrderMap.path
            });
        } catch (error) {
            console.log(error);
            return -1;
        }
        return workOrderMap.path;
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
                time: onlineRecord[key].time.getTime() - 24 * 60 * 1000,
                onlineRate: Math.round(onlineRecord[key].number / 288, 2)
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
            const param = "q=" + device.deviceid + "&s=" + this.ctx.helper.dateFormat(new Date(sTime * 1000)) + "&e=" + this.ctx.helper.dateFormat(new Date(eTime * 1000));
            const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceData, param);
            if(result != -1){
                for(var i in result.data[0].dev_data){
                    const resultMap = {
                        tem: parseFloat(result.data[0].dev_data[i].wd),
                        hum: parseFloat(result.data[0].dev_data[i].sd),
                        pm:  parseFloat(result.data[0].dev_data[i].pm25),
                        co2: parseFloat(result.data[0].dev_data[i].co2),
                        lightIntensity: parseFloat(result.data[0].dev_data[i].zd),
                        time: parseInt(new Date(result.data[0].dev_data[i].cur_time).getTime())
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
            const param = "q=" + deviceid + "&s=" + this.ctx.helper.dateFormat(new Date(sTime * 1000)) + "&e=" + this.ctx.helper.dateFormat(new Date(eTime * 1000));
            const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceData, param);
            if(result != -1){
                for(var i in result.data[0].dev_data){
                    const resultMap = {
                        tem: result.data[0].dev_data[i].wd,
                        hum: result.data[0].dev_data[i].sd,
                        pm:  result.data[0].dev_data[i].pm25,
                        co2: result.data[0].dev_data[i].co2,
                        lightIntensity: result.data[0].dev_data[i].zd,
                        time: parseInt(new Date(result.data[0].dev_data[i].cur_time).getTime())
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
                const param = "q=" + device.deviceid;
                const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceOnlineStatus, param);
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