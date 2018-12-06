'use strict';

const Controller = require('egg').Controller;

class ForgetPasswordController extends Controller {
    async index() {
        await this.ctx.render('manage/forgetPassword.html');
    }

    async findPassword(){
        const { ctx } = this;
        const username = ctx.request.body.username;
        const email = ctx.request.body.email;
        const result = await ctx.service.sign.forgetPassword.findPassword(username, email);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }else if(result == -2){
            return ctx.body = {
                messg: "用户名不存在",
                code: 1003
            };
        }else if(result == -3){
            return ctx.body = {
                messg: "邮箱不匹配",
                code: 1003
            };
        }
        ctx.body = {
            code: 200
        }
    }
}

module.exports = ForgetPasswordController;