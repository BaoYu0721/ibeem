'use strict';

const Controller = require('egg').Controller;

class StatusController extends Controller {
    async getStatus(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceID;
        const result = await ctx.service.device.status.getStatus(deviceId);
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

module.exports = StatusController;