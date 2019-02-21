const Subscription = require('egg').Subscription;

class LoadDeviceData extends Subscription{
    static get schedule(){
        return {
            type: 'worker',
            cron: '0 0 0 * * *',
        };
    }

    async subscribe() {
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:device_data";
        var ttl = 1000;

        var devices;
        try {
            devices = await this.app.mysql.query('select deviceid, type from device;');
        } catch (error) {
            console.log(error)
            return -1;
        }
        for(var i = 0; i < devices.length; ++i){
            const sTime = new Date(this.ctx.helper.dateDayPre(new Date(), 1) + ' 00:00:00').getTime() / 1000;
            const eTime = new Date(this.ctx.helper.dateDayPre(new Date(), 0) + ' 00:00:00').getTime() / 1000;
            if(devices[i].type == 'coclean'){
                const param = {
                    startTime: sTime,
                    endTime: eTime,
                    deviceId: devices[i].deviceid,
                    page: 1,
                    pageSize: 1440
                };
                const result = await this.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.readDeviceDataUrl, param);
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
                        var lastTime = null;
                        try {
                            const deviceData = await this.app.mysql.query('select time from device_data where device_id = ? order by time desc limit 1', [devices[i].deviceid]);
                            if(deviceData.length){
                                lastTime = deviceData[0].time;
                            }
                        } catch (error) {
                            return -1;
                        }
                        if(lastTime && dataMap.time > parseInt(new Date(lastTime).getTime()) || !lastTime){
                            try {
                                await redlock.lock(resource, ttl).then(function(lock) {
                                    async function transation() {
                                        try {
                                            const insertRes = await app.mysql.query('insert into device_data values(null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                                                new Date(dataMap.time),
                                                dataMap.tem,
                                                dataMap.hum,
                                                dataMap.co2,
                                                dataMap.pm,
                                                dataMap.lightIntensity,
                                                new Date(),
                                                new Date(),
                                                0,
                                                devices[i].deviceid
                                            ]);
                                        } catch (error) {
                                            console.log(error);
                                            lock.unlock()
                                            .catch(function(err) {
                                                console.error(err);
                                            });
                                            return -1;
                                        }
                                        lock.unlock()
                                        .catch(function(err) {
                                            console.error(err);
                                        });
                                    }
                                    return transation();
                                });
                            } catch (error) {
                                return -1;
                            }
                        }
                    }
                }
            }else if(devices[i].type == 'ibeem'){

            }
        }
    }

}

module.exports = LoadDeviceData;