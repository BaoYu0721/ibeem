'use strict';

const Service = require('egg').Service;

class IndexService extends Service {
    async pageList(userId, page, pageSize) {
        var device = null;
        var user = null;
        try {
            device = await this.app.mysql.select('device', {where: {owner_id: userId}});
            user = await this.app.mysql.get('user', { id: userId });
        } catch (error) {
            return -1;
        }
        const deviceList = [];
        function addDeviceMap(pname, gname, cname, bname, ownerName, id, deviceName, userName, latitude, longitude, type, address, Online_status, warning_sign, des, memo) {
            const deviceMap = {
              pname: pname,
              gname: gname,
              cname: cname,
              bname: bname,
              ownerName: ownerName,
              id: id,
              deviceName: deviceName,
              userName: userName,
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
                addDeviceMap(device[i].pname, device[i].gname, device[i].cname, device[i].bname, user.name, device[i].id, device[i].name, device[i].uname ? device[i].uname : '', device[i].latitude, 
                    device[i].longitude, device[i].type, device[i].address, device[i].Online_status, device[i].warning_sign, device[i].des, device[i].memo);
            }
        }else if(device.length > (page - 1) * pageSize && device.length < page * pageSize){
            for(var i = (page - 1) * pageSize; i < device.length; ++i){
                addDeviceMap(device[i].pname, device[i].gname, device[i].cname, device[i].bname, user.name, device[i].id, device[i].name, device[i].uname ? device[i].uname : '', device[i].latitude, 
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

    async location(userId) {
        var device = null;
        try {
            device = await this.app.mysql.select('device', {where: {owner_id: userId}});
        } catch (error) {
            return -1;
        }
        const deviceList = [];
        for(var key in device){
            const deviceMap = {
                id: device[key].id,
                deviceName: device[key].name,
                latitude: device[key].latitude,
                longitude: device[key].longitude
            }
            deviceList.push(deviceMap);
        }
        return deviceList;
    }

    async parameter(userId) {
        var dataParameter = null;
        try {
            dataParameter = await this.app.mysql.select('data_parameter', {where: {user_id: userId}});
        } catch (error) {
            return -1;
        }
        return dataParameter;
    }
}

module.exports = IndexService;