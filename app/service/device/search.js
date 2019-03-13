'use strict';

const Service = require('egg').Service;

class SearchService extends Service {
    async search(str, userId) {
        const sqlStr = '%' + str + '%';
        const deviceList = [];
        try {
            var device;
            if(str == "在线" || str == "不在线" || str.toLowerCase() == "not online" || str.toLowerCase() == "online"){
                if(str == "在线" || str.toLowerCase() == "online")
                    device = await this.app.mysql.query('select * from device where Online_status = 1');
                else
                    device = await this.app.mysql.query('select * from device where Online_status = 0');
            }
            else{
                device = await this.app.mysql.query('select * from device where name like ? or type like ? or uname like ? or address like ? or pname like ? or bname like ? or gname like ? or cname like ? or memo like ?', [sqlStr.toUpperCase(), sqlStr.toLowerCase(), sqlStr, sqlStr, sqlStr, sqlStr, sqlStr, sqlStr, sqlStr]);
            }
            for(var key in device){
                const user = await this.app.mysql.get('user', { id: device[key].owner_id });
                const deviceMap = {
                    pname: device[key].pname == null? '': device[key].pname,
                    gname: device[key].gname == null? '': device[key].gname,
                    cname: device[key].cname == null? '': device[key].cname,
                    bname: device[key].bname == null? '': device[key].bname,
                    ownerName: user? user.name == null? '': user.name: '',
                    id: device[key].id,
                    deviceName: device[key].name == null? '': device[key].name,
                    userName: device[key].uname ? device[key].uname : '',
                    latitude: device[key].latitude == null? '': device[key].latitude,
                    longitude: device[key].longitude == null? '': device[key].longitude,
                    type: device[key].type == null? '': device[key].type,
                    address: device[key].address == null? '': device[key].address,
                    status: device[key].Online_status == null? '': device[key].Online_status,
                    waining: device[key].warning_sign == null? '': device[key].warning_sign,
                    description: device[key].des == null? '': device[key].des,
                    memo: device[key].memo == null? '': device[key].memo,
                    status: device[key].Online_status
                };
                deviceList.push(deviceMap);
            }
        } catch (error) {
            return -1;
        }
        return deviceList;
    }
}

module.exports = SearchService;