'use strict';

const Service = require('egg').Service;

class StatusService extends Service {
    async getStatus(deviceId){
        var device = null;
        var status = false;
        try {
            device = await this.app.mysql.get('device', {id: deviceId});
        } catch (error) {
            return -1;
        }
        if(device != null){
            if(device.type == 'coclean'){
                var param = {
                    deviceId: deviceId
                };
                const result = await this.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.deviceIsOnline, param);
                if(result.result == 'success'){
                    if(result.data == 1){
                        status = true;
                    }
                }
            }else if(device.type == 'ibeem'){
                const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceOnlineStatus, deviceId);
                if(result.status == 1){
                    status = true;
                }
            }
        }
        try {
            await this.app.mysql.update('device', {id: deviceId, Online_status: status});
        } catch (error) {
            return -1;
        }
        return status;
    }
}

module.exports = StatusService;