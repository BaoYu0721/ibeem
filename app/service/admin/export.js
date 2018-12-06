'use strict';

const Service = require('egg').Service;

class ExportService extends Service {
    async deviceList(){
        var device = null;
        try {
            device = await this.app.mysql.query('select id, name from device');
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in device){
            const resultMap = {
                id: device[key].id,
                name: device[key].name
            }
            resultList.push(resultMap);
        }
        return resultList;
    }

    async workOrderList(){
        var workOrder = null;
        try {
            workOrder = await this.app.mysql.select('pretreatment_work_order');
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in workOrder){
            const resultMap = {
                id: workOrder[key].id,
                status: workOrder[key].status,
                url: workOrder[key].url,
                deviceName: workOrder[key].device_name,
                startTime: this.ctx.helper.dateFormat(workOrder[key].start_time),
                endTime: this.ctx.helper.dateFormat(workOrder[key].end_time),
                createdTime: this.ctx.helper.dateFormat(workOrder[key].created_on),
                finishedDevice: workOrder[key].finished_device,
                deviceCount: workOrder[key].device_count,
                percentage: parseFloat(workOrder[key].finished_device) / parseFloat(workOrder[key].device_count)
            }
            resultList.push(resultMap);
        }
        return resultList;
    }
}

module.exports = ExportService;