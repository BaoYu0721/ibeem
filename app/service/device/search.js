'use strict';

const Service = require('egg').Service;

class SearchService extends Service {
    async search(str, userId) {
        const sqlStr = '%' + str + '%';
        var device = null;
        var user = null;
        try {
            device = await this.app.mysql.query('select * from device where name like ? or type like ? or uname like ? or address like ?', [sqlStr.toUpperCase(), sqlStr.toLowerCase(), sqlStr, sqlStr]);
            user = await this.app.mysql.get('user', { id: userId });
        } catch (error) {
            return -1;
        }
        const deviceList = [];
        for(var key in device){
            const deviceMap = {
                pname: device[key].pname,
                gname: device[key].gname,
                cname: device[key].cname,
                bname: device[key].bname,
                ownerName: user.name,
                id: device[key].id,
                deviceName: device[key].name,
                userName: device[key].uname ? device[key].uname : '',
                latitude: device[key].latitude,
                longitude: device[key].longitude,
                type: device[key].type,
                address: device[key].address,
                status: device[key].Online_status,
                waining: device[key].warning_sign,
                description: device[key].des,
                memo: device[key].memo
            };
            deviceList.push(deviceMap);
        }
        return deviceList;
    }
}

module.exports = SearchService;