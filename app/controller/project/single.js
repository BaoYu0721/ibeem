'use strict';

const Controller = require('egg').Controller;

class SingleController extends Controller {
    async projectInfo(){
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.single.projectInfo(userId, projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == -2){
            return  ctx.body = {
                messg: "该项目已被删除",
                code: 4005
            };
        }
        ctx.body = {
            project: result,
            code: 200
        };
    }

    async buildingInfo(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.single.buildingInfo(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == -2){
            return  ctx.body = {
                messg: "该建筑已被删除",
                code: 4005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async surveyInfo(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.single.surveyInfo(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == -2){
            return  ctx.body = {
                messg: "该项目已被删除",
                code: 4005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async deviceInfo(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.single.deviceInfo(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == -2){
            return  ctx.body = {
                messg: "该项目已被删除",
                code: 4005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async memberInfo(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.single.memberInfo(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == -2){
            return  ctx.body = {
                messg: "该项目已被删除",
                code: 4005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async projectUpdate(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const name = ctx.request.body.name;
        const describe = ctx.request.body.describe;
        const image = ctx.request.body.image;
        const result = await ctx.service.project.single.projectUpdate(projectId, name, describe, image);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1003
            }; 
        }else if(result == 0){
            return ctx.body = {
                code: 200
            };
        }
    }

    async projectDelete(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.single.projectDelete(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            }; 
        }else if(result == 0 || result == null){
            return ctx.body = {
                code: 200
            };
        }
    }
}

module.exports = SingleController;