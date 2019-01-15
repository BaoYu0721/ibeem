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
        const pageSize = 50;
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
                workOrder: result,
                code: 200
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
        console.log(deviceId)
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
        const reqData = ctx.request.body;
        const result = await ctx.service.admin.device.environmentDataAlign(reqData);
        console.log(result);
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