'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index(){
        const { ctx } = this;
        const item = ctx.query.item;
        if(item == "download" || item == "compare" || item == "view"){
            return await ctx.render('administrator/new_compareDeviceData.html');
        }
        await ctx.render('administrator/deviceList_manage.html');
    }

    async deviceList(){
        const { ctx } = this;
        const page = parseInt(ctx.request.body.pageNo);
        const pageSize = 30;
        const device = await ctx.service.admin.device.deviceList(page, pageSize);
        if(device != -1){
            return ctx.body = {
                code: 200,
                page: device
            };
        }else{
            return ctx.body = {
                code: 1005,
                messg: "系统繁忙，请重试",
            };
        }
    }

    async deviceResearch(){
        const { ctx } = this;
        const str = ctx.request.body.name;
        const device = await ctx.service.admin.device.deviceResearch(str);
        if(device != -1){
          ctx.body = {
            list: device,
            code: 200
          };
        }else{
          ctx.body = {
            messg: "系统繁忙，请重试",
            code: 1005
          };
        }
    }

    async deviceImport(){
        const { ctx } = this;
        const filepath = ctx.request.files[0].filepath;
        const fileCheck = filepath.split('.');
        if(fileCheck[fileCheck.length - 1] != 'xlsx'){
            return ctx.body = {
                code: 1001,
                msg: '文件格式错误!'
            };
        }
        const xlsx = ctx.helper.parseXlsx(filepath);
        if(xlsx[0].data.length <= 1){
            return ctx.body = {
                code: 1000,
                msg: '文件无数据!'
            };
        }
        const device_info = xlsx[0].data;
        if(device_info[0].length != 5 || device_info[0][0] != '设备ID'){
            return ctx.body = {
                code: 1003,
                msg: '文件模板错误'
            };
        }
        for(var i = 1; i < device_info.length; ++i){
            for(var j = 0; j < 5; ++j){
                if(!device_info[i][j]){
                    return ctx.body = {
                        code: 1002,
                        msg: '文件第' + (i + 1) + '行第' + (j + 1) + '列没有数据!'
                    };
                }
            }
        }
        const result = await ctx.service.admin.device.deviceImport(xlsx[0].data);
        if(result == -1){
            return ctx.body = {
                code: 1005
            }
        }
        ctx.body = {
            code: 200
        }
    }

    async deviceDownloadHistory(){
        const { ctx } = this;
        const result = await ctx.service.admin.device.deviceDownloadHistory();
        if(result != -1){
          ctx.body = {
            code: 200,
            list: result
          };
        }else{
          ctx.body = {
            code: 1005
          }
        }
    }

    async createWorkOrder(){
        const { ctx } = this;
        const deviceIds = ctx.request.body.deviceids.split(',');
        const sTime = ctx.request.body.startTime;
        const eTime = ctx.request.body.endTime;
        const d1 = ctx.request.body.d1;
        const d2 = ctx.request.body.d2;
        const d3 = ctx.request.body.d3;
        const d4 = ctx.request.body.d4;
        const d5 = ctx.request.body.d5;
        const workDay = ctx.request.body.workDay;
        const startWorkTime = ctx.request.body.startWorkTime;
        const endWorkTime = ctx.request.body.endWorkTime;
        const step = ctx.request.body.step;
        const result = await ctx.service.admin.device.createWorkOrder(deviceIds, sTime, eTime, d1, d2, d3, d4, d5, workDay, startWorkTime, endWorkTime, step);
        if(result != -1){
            return ctx.body = {
                code: 200,
                filepath: result
            };
        }else{
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1001
            };
        }
    }

    async deviceOnLineRate(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceID;
        const sTime = ctx.request.body.startTime;
        const eTime = ctx.request.body.endTime;
        const result = await ctx.service.admin.device.deviceOnLineRate(sTime, eTime, deviceId);
        if(result != -1){
            return ctx.body = {
                list: result.data,
                deviceName: result.device.name,
                deviceID: deviceId,
                code: 200
            };
        }else{
            return ctx.body = {
            messg: "系统繁忙请重试",
            code: 1005
            };
        }
    }

    async deviceEnvironment(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceId;
        var sTime = ctx.request.body.startTime;
        var eTime = ctx.request.body.endTime;
        const sWorkTime = ctx.request.body.startWorkTime;
        const eWorkTime = ctx.request.body.endWorkTime;
        const workDay = ctx.request.body.workDay;
        const result = await ctx.service.admin.device.deviceEnvironment(deviceId, sTime, eTime, sWorkTime, eWorkTime, workDay);
        if(result == -1){
            return ctx.body = {
                result: "error"
            };
        }else if(result == null){
            return ctx.body = {
                result: "success"
            };
        }else{
            return ctx.body = {
                result: "success",
                data: result.deviceData,
                deviceId: deviceId,
                deviceName: result.deviceName
            }
        }
    }

    async environmentDataAlign(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceId;
        var sTime = ctx.request.body.startTime;
        var eTime = ctx.request.body.endTime;
        const sWorkTime = ctx.request.body.startWorkTime;
        const eWorkTime = ctx.request.body.endWorkTime;
        const workDay = ctx.request.body.workDay;
        const step = ctx.request.body.step;
        const result = await ctx.service.device.view.environmentDataAlign(deviceId, sTime, eTime, sWorkTime, eWorkTime, workDay, step);
        if(result == -1){
            return ctx.body = {
                result: "error"
            };
        }
        ctx.body = result;
    }

    async deviceAdd(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.admin.device.deviceAdd(data);
        if(result != -1){
            return ctx.body = {
                id: result,
                code: 200
            };
        }else{
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
    }

    async deviceUserList(){
        const { ctx } = this;
        const result = await ctx.service.admin.device.deviceUserList();
        if(result != -1){
            return ctx.body = {
                arrayList: result,
                code: 200
            };
        }else{
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
    }

    async deviceSetOwner(){
        const { ctx } = this;
        const userId = ctx.request.body.userID;
        const deviceId = ctx.request.body.deviceID;
        const result = await ctx.service.admin.device.deviceSetOwner(userId, deviceId);
        if(result != -1){
            return ctx.body = {
                code: 200
            };
        }else{
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
    }

    async deviceDelOwner(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceID;
        const result = await ctx.service.admin.device.deviceDelOwner(deviceId);
        if(result != -1){
            return ctx.body = {
                code: 200
            };
        }else{
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
    }

    async deviceStatus(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceID;
        const result = await ctx.service.admin.device.deviceStatus(deviceId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            status: result,
            code: 200
        };
    }
}

module.exports = IndexController;