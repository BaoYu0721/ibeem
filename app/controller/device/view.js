'use strict';

const Controller = require('egg').Controller;

class ViewController extends Controller {

    async getOnlineRate() {
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceID;
        const sTime = ctx.request.body.startTime;
        const eTime = ctx.request.body.endTime;
        const result = await ctx.service.device.view.getOnlineRate(sTime, eTime, deviceId);
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

    async getEnvironmentData() {
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceId;
        const sTime = ctx.request.body.startTime;
        const eTime = ctx.request.body.endTime;
        const sWorkTime = ctx.request.body.startWorkTime;
        const eWorkTime = ctx.request.body.endWorkTime;
        const workDay = ctx.request.body.workDay;
        const result = await ctx.service.device.view.getEnvironmentData(deviceId, sTime, eTime, sWorkTime, eWorkTime, workDay);
        if(result != -1){
            ctx.body = {
                result: "success",
                data: result.envData,
                deviceId: deviceId,
                deviceName: result.device.name
            }
        }else{
            ctx.body = {
            result: "error"
            };
        }
    }

    async getDeviceComplianceRate() {
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('-_-')[0];
        const deviceId = ctx.request.body.deviceID;
        const sTime = ctx.request.body.startTime;
        const eTime = ctx.request.body.endTime;
        const result = await ctx.service.device.view.getDeviceComplianceRate(userId, deviceId, sTime, eTime);
        if(result != -1){
          return ctx.body = {
            name: result.device.name,
            id: deviceId,
            list: result.data,
            code: 200
          };
        }else{
          return ctx.body = {
            code: 1005,
            messg: "系统繁忙请重试"
          };
        }
      }
}

module.exports = ViewController;