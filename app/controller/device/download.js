'use strict';

const Controller = require('egg').Controller;

class DownloadController extends Controller {

    async history() {
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const result = await ctx.service.device.download.history(userId);
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

    async createWorkOrder() {
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
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
        const result = await ctx.service.device.download.createWorkOrder(userId, deviceIds, sTime, eTime, d1, d2, d3, d4, d5, workDay, startWorkTime, endWorkTime, step);
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
}

module.exports = DownloadController;