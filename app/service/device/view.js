'use strict';

const Service = require('egg').Service;

class ViewService extends Service {
    async getOnlineRate(sTime, eTime, deviceId) {
        var onlineRecord = null;
        var device = null;
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
        //需要重写
        var envData = null;
        var device = null;
        try {
            envData = await this.app.mysql.query('select * from device_data where device_id = ? and time between ? and ?', [deviceId, new Date(parseInt(sTime) * 1000), new Date(parseInt(eTime) * 1000)]);
            device = await this.app.mysql.get('device', {id: deviceId});
        } catch (error) {
            return -1;
        }
        const envDataList = [];
        for(var key in envData){
            const isWorkDay = envData[key].time.getDay() == 6 || envData[key].time.getDay() == 7 ? 0 : 1;
            const deviceDataHours = envData[key].time.getHours();
            const deviceDataMinutes = envData[key].time.getMinutes();
            const sWorkTimeHours = sWorkTime.split(':')[0];
            const sWorkTimeMinutes = sWorkTime.split(':')[1];
            const eWorkTimeHours = eWorkTime.split(':')[0];
            const eWorkTimeMinutes = eWorkTime.split(':')[1];
            if(isWorkDay == parseInt(workDay) && deviceDataHours > sWorkTimeHours && deviceDataHours < eWorkTimeHours && deviceDataMinutes > sWorkTimeMinutes && deviceDataMinutes < eWorkTimeMinutes){
                envDataList.push(envData[key]);
            }
        }
        const resultMap = {
            envData: envData,
            device: device
        };
        return resultMap;
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