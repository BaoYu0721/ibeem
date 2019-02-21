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
                onlineRate: Math.floor(onlineRecord[key].number / 288.0 * 100) / 100
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
                                tempList.push(dataMap);
                            }
                        }else if(isWorkDay == 1){
                            if(time.getDay() != 0 && time.getDay() != 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    tempList.push(dataMap);
                                }
                            }
                        }else if(isWorkDay == 2){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                tempList.push(dataMap);
                            }else{
                                if(dTimes > sTimes && dTimes < eTimes){
                                    tempList.push(dataMap);
                                }
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
                                tempList.push(resultMap);
                            }
                        }else if(isWorkDay == 1){
                            if(time.getDay() != 0 && time.getDay() != 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    tempList.push(resultMap);
                                }
                            }
                        }else if(isWorkDay == 2){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                tempList.push(resultMap);
                            }else{
                                if(dTimes > sTimes && dTimes < eTimes){
                                    tempList.push(resultMap);
                                }
                            }
                        }
                    }
                }
            }
        }
        for(var i = parseInt(data.startTime); i < parseInt(data.endTime); i += parseInt(data.step) * 60){
            var temp = null;
            for(var j = 0; j < tempList.length; ++j){
                if(tempList[j].time > i * 1000 && tempList[j].time <= (i + data.step * 60) * 1000){
                    if(temp){
                        temp.tem += tempList[j].tem;
                        temp.hum += tempList[j].hum;
                        temp.pm += tempList[j].pm;
                        temp.co2 += tempList[j].co2;
                        temp.time += tempList[j].time;
                        temp.lightIntensity += tempList[j].lightIntensity;
                        temp.count++;
                    }else{
                        temp = {
                            tem: tempList[j].tem,
                            hum: tempList[j].hum,
                            pm: tempList[j].pm,
                            co2: tempList[j].co2,
                            time: tempList[j].time,
                            lightIntensity: tempList[j].lightIntensity,
                            count: 1
                        };
                    }
                }
            }
            if(temp){
                const resultMap = {
                    tem: temp.tem / temp.count,
                    hum: temp.hum / temp.count,
                    pm: temp.pm / temp.count,
                    co2: temp.co2 / temp.count,
                    time: temp.time / temp.count,
                    lightIntensity: temp.lightIntensity / temp.count
                }
                resultList.push(resultMap);
            }
        }
        return {
            result: "success",
            data: resultList,
            deviceId: data.deviceId,
            deviceName: device.name
        };
    }
}

module.exports = ViewService;