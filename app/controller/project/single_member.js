'use strict';

const Controller = require('egg').Controller;

class SingleMemberController extends Controller {
    async memberSearch(){
        const { ctx } = this;
        const key = ctx.request.body.key;
        const projectId = ctx.request.body.projectId;
        const result = await ctx.service.project.singleMember.memberSearch(key, projectId);
        if(result == -1){
            return ctx.body = {
                messg: "查询用户失败，请重试",
                code: 1004
            };
        }
        ctx.body = {
            arrayList: result,
            code: 200
        };
    }

    async memberAdd(){
        const { ctx } = this;
        const userId = ctx.request.body.userID;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.singleMember.memberAdd(userId, projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async memberDelete(){
        const { ctx } = this;
        const userId = ctx.request.body.userID;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.singleMember.memberDelete(userId, projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙",
                code: 1002
            };
        }else if(result == -2){
            return ctx.body = {
                messg: "您不是项目创建者,无权删除其他管理员",
                code: 1002
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async memberSetManager(){
        const { ctx } = this;
        const userId = ctx.request.body.userID;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.singleMember.memberSetManager(userId, projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async memberManagerRevocation(){
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const ownerId = user.split('^_^')[0];
        const userId = ctx.request.body.userID;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.singleMember.memberManagerRevocation(ownerId, userId, projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }else if(result == -2){
            return ctx.body = {
                messg: "您不是项目创建者,无权撤销其他管理员",
                code: 1002
            };
        }
        ctx.body = {
            code: 200
        };
    }
}

module.exports = SingleMemberController;