const Subscription = require('egg').Subscription;

class LoadDeviceData extends Subscription{
    static get schedule(){
        return {
            type: 'worker',
            cron: '0 * * * * *',
        };
    }

    async subscribe() {
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        var resource = "ibeem_test:device_data";
        var ttl = 1000;

        const standard = await app.mysql.get('data_parameter', {user_id: 24});
        const min_tem   = parseFloat(standard.min_tem);
        const max_tem   = parseFloat(standard.max_tem);
        const min_hum   = parseFloat(standard.min_hum);
        const max_hum   = parseFloat(standard.max_hum);
        const min_light = parseFloat(standard.min_light);
        const max_light = parseFloat(standard.max_light);
        const min_co2   = parseFloat(standard.min_co2);
        const max_co2   = parseFloat(standard.max_co2);
        const min_pm25  = parseFloat(standard.min_pm25);
        const max_pm25  = parseFloat(standard.max_pm25);
        const sTime = new Date(this.ctx.helper.dateDayPre(new Date(), 1) + ' 00:00:00').getTime() / 1000;
        const eTime = new Date(this.ctx.helper.dateDayPre(new Date(), 0) + ' 00:00:00').getTime() / 1000;
        var devices;
        try {
            devices = await this.app.mysql.query('select id, deviceid from device where type = "coclean"');
        } catch (error) {
            console.log(error)
            return -1;
        }
        for(var i in devices){
            var lastTime = null;
            try {
                const deviceData = await this.app.mysql.query('select time from device_data where device_id = ? order by time desc limit 1', [devices[i].deviceid]);
                if(deviceData.length){
                    lastTime = deviceData[0].time;
                }
            } catch (error) {
                return -1;
            }
            const param = {
                startTime: sTime,
                endTime: eTime,
                deviceId: devices[i].deviceid,
                page: 1,
                pageSize: 1440
            };
            const result = await this.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.readDeviceDataUrl, param);
            if(result.result == 'success'){
                if(result.data){
                    for(var key in result.data){
                        const dataMap = {
                            time: parseInt(result.data[key].time),
                            tem: result.data[key].d1,
                            hum: result.data[key].d2,
                            pm: result.data[key].d3,
                            co2: result.data[key].d4,
                            lightIntensity: result.data[key].d5
                        };
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
                                                devices[i].id
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
                                console.log(error);
                                return -1;
                            }
                        }
                    }
                }
                /**
                 * 计算一天在线率
                 */
                var count = 0;
                var timeBuf = sTime;
                for(var k = 0; k < 288; ++k){
                    var flag = 0;
                    for(var h in result.data){
                        const time = parseInt(result.data[h].time) / 1000;
                        if(time >= timeBuf && time < timeBuf + 60 * 5){
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
                        device_id: devices[i].id
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
                /**
                 * 计算一天数据达标率
                 */
                var tem_standard         = 0;
                var hum_standard         = 0;
                var light_standard       = 0;
                var co2_standard         = 0;
                var pm25_standard        = 0;
                var tem_standard_count   = 0;
                var hum_standard_count   = 0;
                var light_standard_count = 0;
                var co2_standard_count   = 0;
                var pm25_standard_count  = 0;
                if(result.data){
                    for(var k in result.data){
                        const tem   = parseFloat(result.data[k].d1);
                        const hum   = parseFloat(result.data[k].d2);
                        const light = parseFloat(result.data[k].d5);
                        const co2   = parseFloat(result.data[k].d4);
                        const pm25  = parseFloat(result.data[k].d3);
                        if(tem >= min_tem && tem <= max_tem)         tem_standard_count++;
                        if(hum >= min_hum && hum <= max_hum)         hum_standard_count++;
                        if(light >= min_light && light <= max_light) light_standard_count++;
                        if(co2 >= min_co2 && co2 <= max_co2)         co2_standard_count++;
                        if(pm25 >= min_pm25 && pm25 <= max_pm25)     pm25_standard_count++;
                    }
                    if(result.data.length){
                        tem_standard   = (tem_standard_count / result.data.length).toFixed(2);
                        hum_standard   = (hum_standard_count / result.data.length).toFixed(2);
                        light_standard = (light_standard_count / result.data.length).toFixed(2);
                        co2_standard   = (co2_standard_count / result.data.length).toFixed(2);
                        pm25_standard  = (pm25_standard_count / result.data.length).toFixed(2);
                    }
                }
                resource = "ibeem_test:standard_rate";
                await redlock.lock(resource, ttl)
                .then(async function(lock){
                    await app.mysql.insert("standard_rate", {
                        device_id:  devices[i].id,
                        user_id:    24,
                        tem:        tem_standard,
                        hun:        hum_standard,
                        light:      light_standard,
                        co2:        co2_standard,
                        pm25:       pm25_standard,
                        time:       new Date(),
                        created_on: new Date(),
                        updated_on: new Date()
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
        try {
            devices = await this.app.mysql.query('select id, deviceid from device where type = "ibeem"');
        } catch (error) {
            console.log(error)
            return -1;
        }
        for(var i in devices){
            var lastTime;
            try {
                const deviceData = await this.app.mysql.query('select time from device_data where device_id = ? order by time desc limit 1', [devices[i].deviceid]);
                if(deviceData.length){
                    lastTime = deviceData[0].time;
                }
            } catch (error) {
                console.log(error)
                return -1;
            }
            const param = "q=" + devices[i].deviceid + "&s=" + this.ctx.helper.dateFormat(new Date(sTime * 1000)) + "&e=" + this.ctx.helper.dateFormat(new Date(eTime * 1000));
            const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceData, param);
            if(result != -1){
                for(var j in result.data[0].dev_data){
                    const dataMap = {
                        time: new Date(result.data[0].dev_data[j].cur_time).getTime(),
                        tem: result.data[0].dev_data[j].wd,
                        hum: result.data[0].dev_data[j].sd,
                        pm: result.data[0].dev_data[j].pm25,
                        co2: result.data[0].dev_data[j].co2,
                        lightIntensity:  result.data[0].dev_data[j].zd
                    };
                    if(lastTime && dataMap.time > new Date(lastTime).getTime() || !lastTime){
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
                                            devices[i].id
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
                    for(var h in result.data[0].dev_data){
                        const time = new Date(result.data[0].dev_data[h].cur_time).getTime() / 1000;
                        if(time >= timeBuf && time < timeBuf + 60 * 5){
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
                        device_id: devices[i].id
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
                /**
                 * 计算一天数据达标率
                 */
                var tem_standard         = 0;
                var hum_standard         = 0;
                var light_standard       = 0;
                var co2_standard         = 0;
                var pm25_standard        = 0;
                var tem_standard_count   = 0;
                var hum_standard_count   = 0;
                var light_standard_count = 0;
                var co2_standard_count   = 0;
                var pm25_standard_count  = 0;
                if(result.data){
                    for(var k in result.data[0].dev_data){
                        const tem   = parseFloat(result.data[0].dev_data[k].wd);
                        const hum   = parseFloat(result.data[0].dev_data[k].sd);
                        const light = parseFloat(result.data[0].dev_data[k].zd);
                        const co2   = parseFloat(result.data[0].dev_data[k].co2);
                        const pm25  = parseFloat(result.data[0].dev_data[k].pm25);
                        if(tem >= min_tem && tem <= max_tem)         tem_standard_count++;
                        if(hum >= min_hum && hum <= max_hum)         hum_standard_count++;
                        if(light >= min_light && light <= max_light) light_standard_count++;
                        if(co2 >= min_co2 && co2 <= max_co2)         co2_standard_count++;
                        if(pm25 >= min_pm25 && pm25 <= max_pm25)     pm25_standard_count++;
                    }
                    if(result.length){
                        tem_standard   = (tem_standard_count / result.data.length).toFixed(2);
                        hum_standard   = (hum_standard_count / result.data.length).toFixed(2);
                        light_standard = (light_standard_count / result.data.length).toFixed(2);
                        co2_standard   = (co2_standard_count / result.data.length).toFixed(2);
                        pm25_standard  = (pm25_standard_count / result.data.length).toFixed(2);
                    }
                }
                resource = "ibeem_test:standard_rate";
                await redlock.lock(resource, ttl)
                .then(async function(lock){
                    await app.mysql.insert("standard_rate", {
                        device_id:  devices[i].id,
                        user_id:    24,
                        tem:        tem_standard,
                        hun:        hum_standard,
                        light:      light_standard,
                        co2:        co2_standard,
                        pm25:       pm25_standard,
                        time:       new Date(),
                        created_on: new Date(),
                        updated_on: new Date()
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

module.exports = LoadDeviceData;