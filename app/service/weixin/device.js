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

    async deviceRealtimeData(deviceId){
        var device = null;
        try {
            device = await this.app.mysql.get('device', {id: deviceId})
        } catch (error) {
            return -1;
        }
        const resultMap = {};
        if(device.type == 'ibeem'){
            const param = "q=" + deviceId;
            const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getRealtimeData, param);
            if(result.data.length){
                resultMap.tem = result.data.wd,
                resultMap.hum = result.data.sd,
                resultMap.pm = result.data.pm25,
                resultMap.co2 = result.data.co2,
                resultMap.lightIntensity = result.data.zd
            }
        }else if(device.type == 'coclean'){
            var param = {
                deviceId: deviceId
            };
            const result = await this.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.readDeviceRealtimeDataUrl, param);
            console.log(result)
            if(result.result == 'success'){
                const arr = result.result.data.split(',');
                resultMap.tem = data.parseFloat(arr[1]),
                resultMap.hum = data.parseFloat(arr[2]),
                resultMap.pm = data.parseFloat(arr[3]),
                resultMap.co2 = data.parseFloat(arr[4]),
                resultMap.lightIntensity = data.parseFloat(arr[5])
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
        return assessment.content;
    }
}

module.exports = DeviceService;