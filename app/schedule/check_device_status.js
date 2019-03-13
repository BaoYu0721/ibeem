const Subscription = require('egg').Subscription;

class CheckDeviceStatus extends Subscription{
    static get schedule(){
        return {
            type: 'worker',
            cron: '0 */5 * * * *',
        };
    }

    async subscribe() {
        const { ctx, app } = this;
        try {
            const device = await app.mysql.select('device');
            for(var key in device){
                var status = false;
                if(device[key].type == 'coclean'){
                    const param = {
                        deviceId: device[key].id
                    };
                    const result = await ctx.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.deviceIsOnline, param);
                    if(result.result == 'success'){
                        if(result.data == 1){
                            status = true;
                        }
                    }
                }
                else if(device[key].type == 'ibeem'){
                    const param = "q=" + device[key].deviceid;
                    const result = await ctx.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceOnlineStatus, param);
                    if(result.status == 1){
                        status = true;
                    }
                }
                await this.app.mysql.update('device', {id: device[key].id, Online_status: status});
            }
        } catch (error) {
            console.log('CheckDeviceStatus Error' + error);
        }
    }
}
module.exports = CheckDeviceStatus;