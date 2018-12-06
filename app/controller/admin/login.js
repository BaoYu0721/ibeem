'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index(){
        const { ctx } = this;
        await ctx.render('administrator/login_manage.html');
    }

    async adminLogin(){
        const { ctx, config } = this;
        const username = ctx.request.body.username;
        const password = ctx.request.body.password;
        if(username != config.admin.name){
            return ctx.body = {
                messg: "用户名错误!",
                status: -1
            };
        }
        if(ctx.helper.crypto(password) != config.admin.password){
            return ctx.body = {
                messg: "密码错误!",
                status: -1
            };
        }
        // 存入Cookie, 用于验证过期.
        const auth_name = '^_^' + config.auth_cookie_admin + '^_^';
        const opts = {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            signed: true,
            httpOnly: false,
        };
        try {
            ctx.cookies.set(config.auth_cookie_admin, ctx.helper.crypto(auth_name), opts);
        } catch (error) {
            ctx.cookies.set(config.auth_cookie_admin, null);
            return ctx.body = {
                status: -1,
                messg: "系统繁忙请重试"
            };
        }
        ctx.body = {
            status: 0
        };
    }

    async adminLogout(){
        const { ctx } = this;
        ctx.cookies.set(ctx.app.config.auth_cookie_admin, null);
        ctx.body = {
            code: 200
        };
    }
}

module.exports = IndexController;