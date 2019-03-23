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
            const status  = new Array();

            const coclean = await app.mysql.query('select id, physical_id from device where type = "coclean"');
            const physical_ids = new Array();
            for(var key in coclean){
                physical_ids.push(coclean[key].physical_id);           
            }
            const coclean_res1 = await ctx.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.deviceIsOnlineBatch, {"physicalIds": physical_ids});
            if(coclean_res1.result == 'success'){
                for(var key in coclean_res1.data){
                    const coclean_status = {
                        device_id:     coclean_res1.data[key].device_id,
                        online_status: coclean_res1.data[key].online_status
                    };
                    status.push(coclean_status);
                }
            }else if(coclean_res1.result == 'error'){
                // 剔除异常设备
                if(coclean_res1.errorMsg && coclean_res1.errorMsg.data){
                    for(var i in coclean_res1.errorMsg.data){
                        const device = await app.mysql.query('select id from device where physical_id = ?', [coclean_res1.errorMsg.data[i]]);
                        const param = {
                            deviceId: device[0].id
                        };
                        const coclean_res2 = await ctx.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.deviceIsOnline, param);
                        if(coclean_res2.result == 'success'){
                            const coclean_status = new Object();
                            if(coclean_res2.data == 1){
                                coclean_status.online_status = 1;
                            }
                            else{
                                coclean_status.online_status = 0;
                            }
                            coclean_status.device_id = device[0].id;
                            status.push(coclean_status);
                        }
                        const index = physical_ids.indexOf(coclean_res1.errorMsg.data[i]);
                        physical_ids.splice(index, 1);
                    }
                    const coclean_res3 = await ctx.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.deviceIsOnlineBatch, {"physicalIds": physical_ids});
                    if(coclean_res3.result == 'success'){
                        for(var key in coclean_res3.data){
                            const coclean_status = {
                                device_id:     coclean_res3.data[key].device_id,
                                online_status: coclean_res3.data[key].online_status
                            };
                            status.push(coclean_status);
                        }
                    }
                }
            }

            const ibeem = await app.mysql.query('select id, deviceid from device where type = "ibeem"');
            for(var key in ibeem){
                const param = "q=" + ibeem[key].deviceid;
                const ibeem_res = await ctx.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceOnlineStatus, param);
                const ibeem_status = new Object();
                if(ibeem_res.status == 1){
                    ibeem_status.online_status = 1;
                }
                else{
                    ibeem_status.online_status = 0;
                }
                ibeem_status.device_id = ibeem[key].id;
                status.push(ibeem_status);
            }

            for(var key in status){
                await this.app.mysql.update('device', {id: status[key].device_id, Online_status: status[key].online_status});
            }
        } catch (error) {
            console.log('CheckDeviceStatus Error' + error);
        }
    }
}
module.exports = CheckDeviceStatus;