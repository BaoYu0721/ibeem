'use strict';

const Service = require('egg').Service;

class DeviceService extends Service {
    async deviceList(page, pageSize){
        var device = null;
        try {
            device = await this.app.mysql.select('device');
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
}

module.exports = DeviceService;