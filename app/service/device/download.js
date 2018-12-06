'use strict';

const Service = require('egg').Service;

class DownloadService extends Service {
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

    async createWorkOrder(userId, deviceIds, sTime, eTime, d1, d2, d3, d4, d5, workDay, startWorkTime, endWorkTime, step){
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
            user_id: userId,
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
                work_id: workOrderMap.work_id != undefined ? workOrderMap.work_id: '',
                ids: workOrderMap.ids != undefined ? workOrderMap.ids: '',
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
}

module.exports = DownloadService;