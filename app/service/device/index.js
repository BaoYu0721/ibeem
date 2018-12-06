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

    async deviceInfo(deviceId){
        var device = null;
        try {
            device = await this.app.mysql.get('device', {id: deviceId});
        } catch (error) {
            return -1;
        }
        var attentionNames = '';
        if(device != null){
            try {
                var deviceAttention = await this.app.mysql.select('device_attention', {where: {device_id: deviceId}});
                for(var key in deviceAttention){
                    var user = await this.app.mysql.get('user', {id: deviceAttention[key].user_id});
                    if(key == deviceAttention.length -1){
                        attentionNames += user.name;
                        break;
                    }
                    attentionNames += user.name + ',';
                }
            } catch (error) {
                return -1;
            }
        }
        var owner = null;
        var user = null;
        try {
            owner = await this.app.mysql.get('user', {id: device.owner_id});
            user = await this.app.mysql.get('user', {id: device.user_id});
        } catch (error) {
            return -1;
        }
        var imageList = [];
        if(device.image){
            if(device.image.indexOf(',') != -1){
                const image = device.image.split(',');
                for(var key in image){
                    const imageMap = {
                        img: image[key]
                    };
                    imageList.push(imageMap);
                }
            }else{
                const imageMap = {
                    img: device.image
                };
                imageList.push(imageMap);
            }
        }
        const deviceMap = {
            id: device.id,
            name: device.name,
            source: device.source,
            type: device.type,
            owner: owner == null? '': owner.name,
            user: user == null? '': user.name,
            longitude: device.longitude,
            latitude: device.latitude,
            address: device.address,
            warnning: device.warning_sign,
            describe: device.describe,
            onlineStatus: device.Online_status,
            QRcode: device.QR_code,
            memo: device.memo,
            gname: attentionNames,
            wechat: device.wechat,
            imageList: imageList
        };
        return deviceMap;
    }

    async deviceUpdate(userId, deviceInfo){
        var isAttention = null;
        try {
            isAttention = await this.app.mysql.get('device_attention', {device_id: deviceInfo.id, user_id: userId});
        } catch (error) {
            return -1;
        }
        if(isAttention || userId == 24){
            var result = null;
            try {
                result = await this.app.mysql.update('device', {
                    id: deviceInfo.id,
                    address: deviceInfo.address,
                    des: deviceInfo.describe,
                    image: deviceInfo.image,
                    wechat_name: deviceInfo.wechat,
                    warning_sign: deviceInfo.warning,
                    memo: deviceInfo.memo,
                })
            } catch (error) {
                return -1;
            }
            if(result.affectedRows != 1){
                return -1;
            }
        }else{
            return -2;
        }
        return 0;
    }
}

module.exports = IndexService;