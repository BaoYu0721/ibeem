const Subscription = require('egg').Subscription;

class WorkOrder extends Subscription{
    static get schedule(){
        return {
            type: 'worker',
            cron: '0 * * * * *',
        };
    }

    async subscribe() {
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:work_order";
        var ttl = 1000;

        const result = await this.ctx.service.device.download.getUnfinishWorkOrder();
        for(var key in result){
            if(result[key].type == 0){
                const res = await this.coclean(result[key]);
                try {
                    if(res.status == 'finish'){
                        this.ctx.helper.floderToZip(res.pathname, res.flodername);
                        const filename = './public/file/csv/' + res.flodername + '.zip';
                        const url = res.url;
                        await redlock.lock(resource, ttl).then(function(lock) {
                            async function transation() {
                                try {
                                    await app.mysql.query('update work_order set url = ?, status = ?, path = ?, percent = ?, estimate_time = ? where work_id = ?',
                                        [url, 'finish', filename, 100, 0, result[key].work_id]
                                    );
                                } catch (error) {
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
                    }else if(res.status == 'failure'){
                        await redlock.lock(resource, ttl).then(function(lock) {
                            async function transation() {
                                try {
                                    await app.mysql.query('update work_order set status = ? where work_id = ?',
                                        ['failure', result[key].work_id]
                                    );
                                } catch (error) {
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
                    }
                } catch (error) {
                    return -1;
                }
            }else if(result[key].type == 1){
                const res = await this.ibeem(result[key]);
                this.ctx.helper.floderToZip(res.pathname, res.flodername);
                const filename = './public/file/csv/' + res.flodername + '.zip';
                try {
                    await redlock.lock(resource, ttl).then(function(lock) {
                        async function transation() {
                            try {
                                await app.mysql.query('update work_order set status = ?, path = ?, percent = ?, estimate_time = ? where ids = ?',
                                    ['finish', filename, 100, 0, result[key].ids]
                                );
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
            }else if(result[key].type == 2){

            }
        }
    }

    async coclean(workOrder) {
        const json = {
            category: 'exportData',
            orderId: workOrder.work_id.toString()
        }
        var result = await this.ctx.service.utils.http.cocleanPost(this.app.config.deviceDataReqUrl.coclean.statusWorkOrder, json);
        console.log(result);
        if(result == -1){
            return -1;
        }
        var resData = {};
        if(result.result == 'success'){
            const sTime = new Date(workOrder.start_time).getTime() / 1000;
            const eTime = new Date(workOrder.end_time).getTime() / 1000;
            const sWorkTime = workOrder.begin_work_time;
            const eWorkTime = workOrder.end_work_time;
            const isWorkDay = workOrder.work_day;
            const sWorkHour = parseInt(sWorkTime.split(':')[0]);
            const sWorkMinute = parseInt(sWorkTime.split(':')[1]);
            const eWorkHour = parseInt(eWorkTime.split(':')[0]);
            const eWorkMinute = parseInt(eWorkTime.split(':')[1]);
            if(result.data[0].status == 'finish'){
                const url = result.data[0].data_file;
                const data = await this.ctx.service.utils.http.urlReq(url);
                if(data == -1) return -1;
                var dataArr = data.split('\n');
                var dataList = [];
                var title;
                // 往dataList push数据
                function dataListPush(dataList, title, arr){
                    if(dataList.length == 0){
                        var dataListNode = [];
                        dataListNode.push(title);
                        dataListNode.push(arr);
                        dataList.push(dataListNode);
                    }else{
                        var flag = false;
                        for(var j = 0; j < dataList.length; ++j){
                            if(arr[0] == dataList[j][1][0]){
                                flag = true;
                                dataList[j].push(arr);
                            }
                        }
                        if(!flag){
                            var dataListNode = [];
                            dataListNode.push(title);
                            dataListNode.push(arr);
                            dataList.push(dataListNode);
                        }
                    }
                }
                for(var i = 0; i < dataArr.length; ++i){
                    const arr = dataArr[i].slice(0, dataArr[i].length - 1).split(',');
                    if(i == 0){
                        title = arr;
                        continue;
                    }
                    var time;
                    if(title[1] == 'Time'){
                        time = new Date(arr[1]);
                    }else if(title[2] == 'Time'){
                        time = new Date(arr[2]);
                    }
                    if(parseInt(time.getTime() / 1000) > parseInt(sTime) && parseInt(time.getTime() / 1000) < parseInt(eTime)){
                        const hour = parseInt(time.getHours());
                        const minute = parseInt(time.getMinutes());
                        const dTimes = hour * 60 + minute;
                        const sTimes = sWorkHour * 60 + sWorkMinute;
                        const eTimes = eWorkHour * 60 + eWorkMinute; 
                        if(isWorkDay == 0){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    dataListPush(dataList, title, arr);
                                }
                            }
                        }else if(isWorkDay == 1){
                            if(time.getDay() != 0 && time.getDay() != 6){
                                dataListPush(dataList, title, arr);
                            }
                        }else if(isWorkDay == 2){
                            if(time.getDay() == 0 || time.getDay() == 6){
                                if(dTimes > sTimes && dTimes < eTimes){
                                    dataListPush(dataList, title, arr);
                                }
                            }else{
                                dataListPush(dataList, title, arr);
                            }
                        }
                    }
                }
                const flodername = parseInt(new Date().getTime() / 1000);
                const path = './tmp/' + flodername + '/';
                if(this.ctx.helper.mkdirSync(path)){
                    if(dataList.length == 0){
                        const deviceNameList = workOrder.device_name.split(',');
                        for(var i = 0; i < deviceNameList.length; ++i){
                            var dataListNode = [];
                            dataListNode.push(title);
                            dataList.push(dataListNode);
                            const filepath = path + deviceNameList[i] + '.csv';
                            this.ctx.helper.xlsxWriteFile(dataList[i], filepath);
                        }
                    }else{
                        for(var i = 0; i < dataList.length; ++i){
                            const filepath = path + dataList[i][1][0] + '.csv';
                            this.ctx.helper.xlsxWriteFile(dataList[i], filepath);
                        }
                    }
                }
                resData.flodername = flodername;
                resData.pathname = './app/public/file/csv/';
                resData.status = 'finish';
                resData.url = url;
            }
            // }else{
            //     resData.status = 'failure';
            // }
        }else{
            resData.status = 'unfinish';
        }
        return resData;
    }

    async ibeem(workOrder){
        const deviceId = workOrder.ids;
        const sTime = workOrder.start_time;
        const eTime = workOrder.end_time;
        const sWorkTime = workOrder.begin_work_time;
        const eWorkTime = workOrder.end_work_time;
        const isWorkDay = workOrder.work_day;
        const sWorkHour = parseInt(sWorkTime.split(':')[0]);
        const sWorkMinute = parseInt(sWorkTime.split(':')[1]);
        const eWorkHour = parseInt(eWorkTime.split(':')[0]);
        const eWorkMinute = parseInt(eWorkTime.split(':')[1]);
        const param = "q=" + deviceId + "&s=" + this.ctx.helper.dateFormat(new Date(sTime)) + "&e=" + this.ctx.helper.dateFormat(new Date(eTime));
        const result = await this.service.utils.http.ibeemGet(this.app.config.deviceDataReqUrl.ibeem.getDeviceData, param);
        if(result == -1){
            return -1;
        }
        var dataList = [];
        for(var key in result.data){
            var device = [['name', 'time', 'wd', 'zd', 'co2', 'pm25', 'sd']];
            for(var i in result.data[key].dev_data){
                var envData = [];
                envData.push(result.data[key].dev_id);
                envData.push(result.data[key].dev_data[i].time);
                envData.push(result.data[key].dev_data[i].wd? result.data[key].dev_data[i].wd: '');
                envData.push(result.data[key].dev_data[i].zd? result.data[key].dev_data[i].zd: '');
                envData.push(result.data[key].dev_data[i].co2? result.data[key].dev_data[i].co2: '');
                envData.push(result.data[key].dev_data[i].pm25? result.data[key].dev_data[i].pm25: '');
                envData.push(result.data[key].dev_data[i].sd? result.data[key].dev_data[i].sd: '');
                const time = new Date(result.data[key].dev_data[i].time);
                const hours = parseInt(time.getHours());
                const minutes = parseInt(time.getMinutes());
                const dTimes = hours * 60 + minutes;
                const sTimes = sWorkHour * 60 + sWorkMinute;
                const eTimes = eWorkHour * 60 + eWorkMinute; 
                if(isWorkDay == 0){
                    if(time.getDay() == 0 || time.getDay() == 6){
                        if(dTimes > sTimes && dTimes < eTimes){
                            device.push(envData);
                        }
                    }
                }else if(isWorkDay == 1){
                    if(time.getDay() != 0 && time.getDay() != 6){
                        device.push(envData);
                    }
                }else if(isWorkDay == 2){
                    if(time.getDay() == 0 || time.getDay() == 6){
                        if(dTimes > sTimes && dTimes < eTimes){
                            device.push(envData);
                        }
                    }else{
                        device.push(envData);
                    }
                }
                device.push(envData);
            }
            dataList.push(device);
        }
        const flodername = parseInt(new Date().getTime() / 1000);
        const path = './tmp/' + flodername + '/';
        if(this.ctx.helper.mkdirSync(path)){
            if(dataList.length){
                for(var i = 0; i < dataList.length; ++i){
                    const filepath = path + result.data[i].dev_id + '.csv';
                    this.ctx.helper.xlsxWriteFile(dataList[i], filepath);
                }
            }
        }
        const resData = {
            pathname: './app/public/file/csv/',
            flodername: flodername
        };
        return resData;
    }
}

module.exports = WorkOrder;