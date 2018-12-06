'use strict';

const Controller = require('egg').Controller;

class RegisterController extends Controller {
    async index() {
        await this.ctx.render('manage/register.html');
    }

    async userRegister() {
        const { ctx } = this;
        const user = {
            userName: ctx.request.body.userName,
            password: ctx.request.body.password,
            email: ctx.request.body.email,
            workplace: ctx.request.body.workplace,
            position: ctx.request.body.position,
            mobilePhone: ctx.request.body.mobilePhone,
            portrait: ctx.request.body.portrait,
            name: ctx.request.body.name,
        };
        const result = await ctx.service.sign.register.userRegister(user);
        if(result == -1){
            return ctx.body = {
                messg: "网络繁忙,请重新尝试!",
                code: 1001
            };
        }else if(result == -2){
            return ctx.body = {
                messg: "创建用户失败，用户名已存在",
                code: 1001
            };
        }
        return ctx.body = {
            code: 200
        };
    }
}

module.exports = RegisterController;