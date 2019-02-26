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
        var resource = "ibeem_test:device_data";
        var ttl = 1000;

        var devices;
        try {
            devices = await this.app.mysql.query('select deviceid, type from device;');
        } catch (error) {
            console.log(error)
            return -1;
        }
        const sTime = new Date(this.ctx.helper.dateDayPre(new Date(), 1) + ' 00:00:00').getTime() / 1000;
        const eTime = new Date(this.ctx.helper.dateDayPre(new Date(), 0) + ' 00:00:00').getTime() / 1000;
        for(var i = 0; i < devices.length; ++i){
            var lastTime = null;
            try {
                const deviceData = await this.app.mysql.query('select time from device_data where device_id = ? order by time desc limit 1', [devices[i].deviceid]);
                if(deviceData.length){
                    lastTime = deviceData[0].time;
                }
            } catch (error) {
                return -1;
            }
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
                    const data = {};
                    for(var key in result.data){
                        const dataMap = {
                            time: parseInt(result.data[key].time),
                            tem: result.data[key].d1,
                            hum: result.data[key].d2,
                            pm: result.data[key].d3,
                            co2: result.data[key].d4,
                            lightIntensity: result.data[key].d5
                        };
                        data.push(dataMap);
                        if(lastTime && dataMap.time > parseInt(new Date(lastTime).getTime()) || !lastTime){
                            try {
                                await redlock.lock(resource, ttl).then(function(lock) {
                                    async function transation() {
                                        try {
                                            await app.mysql.query('insert into device_data values(null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
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
                    var count = 0;
                    var timeBuf = sTime;
                    for(var k = 0; k < 288; ++k){
                        var flag = 0;
                        for(var h in data){
                            const time = data[h].time / 1000;
                            if(time >= sTime && time < timeBuf + 60 * 5){
                                flag = 1;
                            }
                        }
                        count += flag;
                        timeBuf += 60 * 5;
                    }
                    resource = "ibeem_test:online_record";
                    await redlock.lock(resource, ttl)
                    .then(async function(lock){
                        await app.mysql.insert("online_record", {
                            number: count,
                            time: new Date(),
                            device_id: devices[i].deviceId
                        });
                        lock.unlock()
                        .catch(function(err){
                            console.log(err);
                        });
                    })
                    .catch(function(err){
                        console.log(err);
                        lock.unlock()
                        .catch(function(err){
                            console.log(err);
                        });
                    });
                }
            }else if(devices[i].type == 'ibeem'){
                const param = "q=" + device[i].deviceid + "&s=" + this.ctx.helper.dateFormat(new Date(sTime * 1000)) + "&e=" + this.ctx.helper.dateFormat(new Date(eTime * 1000));
                const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceData, param);
                if(result != -1){
                    for(var key in result.data){
                        const data = {};
                        for(var i in result.data[key].dev_data){
                            const dataMap = {
                                time: parseInt(result.data[key].time),
                                tem: result.data[key].dev_data[i].wd,
                                hum: result.data[key].dev_data[i].sd,
                                pm: result.data[key].dev_data[i].pm25,
                                co2: result.data[key].dev_data[i].co2,
                                lightIntensity:  result.data[key].dev_data[i].zd
                            };
                            data.push(dataMap);
                            if(lastTime && dataMap.time > parseInt(new Date(lastTime).getTime()) || !lastTime){
                                try {
                                    await redlock.lock(resource, ttl).then(function(lock) {
                                        async function transation() {
                                            try {
                                                await app.mysql.query('insert into device_data values(null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
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
                    var count = 0;
                    var timeBuf = sTime;
                    for(var k = 0; k < 288; ++k){
                        var flag = 0;
                        for(var h in data){
                            const time = data[h].time / 1000;
                            if(time >= sTime && time < timeBuf + 60 * 5){
                                flag = 1;
                            }
                        }
                        count += flag;
                        timeBuf += 60 * 5;
                    }
                    resource = "ibeem_test:online_record";
                    await redlock.lock(resource, ttl)
                    .then(async function(lock){
                        await app.mysql.insert("online_record", {
                            number: count,
                            time: new Date(),
                            device_id: devices[i].deviceId
                        });
                        lock.unlock()
                        .catch(function(err){
                            console.log(err);
                        });
                    })
                    .catch(function(err){
                        console.log(err);
                        lock.unlock()
                        .catch(function(err){
                            console.log(err);
                        });
                    });
                }
            }
        }
    }
}

module.exports = LoadDeviceData;