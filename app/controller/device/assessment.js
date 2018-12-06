'use strict';

const Controller = require('egg').Controller;

class AssessmentController extends Controller {
    async index(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceId;
        const result = await ctx.service.device.assessment.index(deviceId);
        if(result == -1){
            return ctx.body = {
                messg: "网络繁忙,请重试!",
                code: 1005
            };
        }
        return ctx.body = {
            content: result,
            code: 200
        };
    }

    async save(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceID;
        const content = ctx.request.body.content;
        const result = await ctx.service.device.assessment.save(deviceId, content);
        if(result == -1){
            return ctx.body = {
                messg: "网络繁忙,请重试!",
                code: 1005
            };
        }
        return ctx.body = {
            code: 200
        };
    }
}

module.exports = AssessmentController;