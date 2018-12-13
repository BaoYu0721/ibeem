'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index(){
        await this.ctx.render('administrator/userList_manage.html');
    }

    async userList(){
        const { ctx } = this;
        const result = await ctx.service.admin.user.userList();
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            userList: result,
            code: 200
        };
    }

    async userChangePassword(){
        const { ctx } = this;
        const userId = ctx.request.body.userID;
        const password = ctx.request.body.password;
        const result = await ctx.service.admin.user.userChangePassword(userId, password);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }else if( result == null){
            return ctx.body = {
                messg: "该用户已被删除",
                code: 1005
            };
        }
        ctx.body = {
            userList: result,
            code: 200
        };
    }
}

module.exports = IndexController;