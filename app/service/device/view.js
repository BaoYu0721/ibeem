'use strict';

const Service = require('egg').Service;

class ViewService extends Service {
    async getOnlineRate(sTime, eTime, deviceId) {
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

    async getEnvironmentData(deviceId, sTime, eTime, sWorkTime, eWorkTime, workDay) {
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
        }
        const resData = {
            deviceData: daviceDataList,
            deviceName: device.name
        };
        return resData;
    }

    async getDeviceComplianceRate(userId, deviceId, sTime, eTime) {
        var rateData = null;
        var device = null;
        try {
            rateData = await this.app.mysql.query('select * from standard_rate where user_id = ? and device_id = ? and time between ? and ?', [userId, deviceId, sTime, new Date(Date.parse(eTime) + 24 * 60 * 60 * 1000)]);
            device = await this.app.mysql.get('device', {id: deviceId});
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in rateData){
            const resultMap = {
                time: rateData[key].time.getTime(),
                tem: parseFloat(rateData[key].tem).toFixed(3),
                hum: parseFloat(rateData[key].tem).toFixed(3),
                light: parseFloat(rateData[key].light).toFixed(3),
                co2: parseFloat(rateData[key].co2).toFixed(3),
                pm25: parseFloat(rateData[key].pm25).toFixed(3)
            };
            resultList.push(resultMap);
        }
        const res = {
            data: resultList,
            device: device
        };
        return res;
    }
}

module.exports = ViewService;