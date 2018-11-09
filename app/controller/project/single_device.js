'use strict';

const Controller = require('egg').Controller;

class SingleDeviceController extends Controller {
    async deviceSearch(){
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const result = await ctx.service.project.singleDevice.deviceSearch(userId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async deviceAdd(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const ids = ctx.request.body.ids.split(',');
        const result = await ctx.service.project.singleDevice.deviceAdd(projectId, ids);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == 0){
            ctx.body = {
                code: 200
            };
        }
    }

    async deviceRecycle(){
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const ids = ctx.request.body.ids.split(',');
        const result = await ctx.service.project.singleDevice.deviceRecycle(userId, ids);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == 0){
            ctx.body = {
                code: 200
            };
        }
    }

    async deviceAttention(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.singleDevice.deviceAttention(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            user: result,
            code: 200
        };
    }

    async deviceRelieve(){
        const { ctx } = this;
        const ids = ctx.request.body.deviceID.split(',');
        const result = await ctx.service.project.singleDevice.deviceRelieve(ids);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }
}

module.exports = SingleDeviceController;