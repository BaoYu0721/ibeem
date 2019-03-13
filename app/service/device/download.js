'use strict';

const Service = require('egg').Service;

class DownloadService extends Service {
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
                envData.push(result.data[key].dev_data[i].wd);
                envData.push(result.data[key].dev_data[i].sd);
                envData.push(result.data[key].dev_data[i].zd);
                envData.push(result.data[key].dev_data[i].co2);
                envData.push( result.data[key].dev_data[i].pm25);
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

    async createWorkOrder(userId, deviceIds, sTime, eTime, d1, d2, d3, d4, d5, workDay, startWorkTime, endWorkTime, step){
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
            user_id: userId,
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
    
    async history(userId) {
        var result = null;
        try {
            result = await this.app.mysql.query('select * from work_order where user_id = ? order by id desc', [userId]);
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

    async getUnfinishWorkOrder(){
        const { app } = this;
        var result = null;
        try {
            result = await app.mysql.select('work_order', {where:{
                status: 'unfinish'
            }});
        } catch (error) {
            return -1;
        }
        return result;
    }
}

module.exports = DownloadService;