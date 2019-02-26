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
              pname: pname == null? '': pname,
              gname: gname == null? '': gname,
              cname: cname == null? '': cname,
              bname: bname == null? '': bname,
              ownerName: ownerName == null? '': ownerName,
              id: id,
              deviceName: deviceName == null? '': deviceName,
              userName: userName == null? '': userName,
              latitude: latitude == null? '': latitude,
              longitude: longitude == null? '': longitude,
              type: type == null? '': type,
              address: address == null? '': address,
              status: Online_status == null? '': Online_status,
              waining: warning_sign == null? '': warning_sign,
              description: des == null? '': des,
              memo: memo == null? '': memo
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
        const result = {
            id: dataParameter[0].id,
            userId: dataParameter[0].user_id,
            maxCo2: dataParameter[0].max_co2,
            maxHum: dataParameter[0].max_hum,
            maxLight: dataParameter[0].max_light,
            maxPm25: dataParameter[0].max_pm25,
            maxTem: dataParameter[0].max_tem,
            minCo2: dataParameter[0].min_co2,
            minHum: dataParameter[0].min_hum,
            minLight: dataParameter[0].min_light,
            minPm25: dataParameter[0].min_pm25,
            minTem: dataParameter[0].min_tem,
            createdOn: dataParameter[0].created_on,
            updatedOn: dataParameter[0].updated_on,
            deleted: dataParameter[0].deleted
        };
        return result;
    }

    async parameterSave(parameter, uid){
        const { app } = this;
        console.log(parameter)
        try {
            if(parameter.id == -1 || !parameter){
                await app.mysql.insert('data_parameter', {
                    user_id:   uid,
                    min_tem:   parameter.minTem,
                    max_tem:   parameter.maxTem,
                    min_hum:   parameter.minHum,
                    max_hum:   parameter.maxHum,
                    min_light: parameter.minLight,
                    max_light: parameter.maxLight,
                    min_co2:   parameter.minCo2,
                    max_co2:   parameter.maxCo2,
                    min_pm25:  parameter.minPm25,
                    max_pm25:  parameter.maxPm25,
                    created_on:new Date(),
                    updated_on:new Date()
                });
            }
            else{
                await app.mysql.update('data_parameter', {
                    id:        parameter.id,
                    user_id:   uid,
                    min_tem:   parameter.minTem,
                    max_tem:   parameter.maxTem,
                    min_hum:   parameter.minHum,
                    max_hum:   parameter.maxHum,
                    min_light: parameter.minLight,
                    max_light: parameter.maxLight,
                    min_co2:   parameter.minCo2,
                    max_co2:   parameter.maxCo2,
                    min_pm25:  parameter.minPm25,
                    max_pm25:  parameter.maxPm25,
                    created_on:new Date(),
                    updated_on:new Date()
                });
            }
        } catch (error) {
            console.log("file [service/device/index] function [parameterSave]");
            return -1;
        }
        return parameter;
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
            address: device.address,
            describe: device.des,
            type: device.type,
            owner: owner == null? '': owner.name,
            user: user == null? '': user.name,
            longitude: device.longitude,
            latitude: device.latitude,
            address: device.address,
            warnning: device.warning_sign,
            onlineStatus: device.Online_status,
            QRcode: device.QR_code,
            memo: device.memo,
            gname: attentionNames,
            wechat: device.wechat_name,
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
                });
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