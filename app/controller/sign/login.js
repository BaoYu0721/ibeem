'use strict';

const Controller = require('egg').Controller;

class LoginController extends Controller {

    async loginAuth() {
        const { ctx } = this;
        const username = ctx.request.body.username;
        const password = ctx.request.body.password;
        const user = await ctx.service.sign.login.loginAuth(username, ctx.helper.crypto(password));
        if(user == -1){
            return ctx.body = {
            status: -1,
            messg: 1
            };
        }else if(!user){
            return ctx.body = {
            status: -1,
            messg: 2
            };
        }
        // 存入Cookie, 用于验证过期.
        const auth_name = user.id + '^_^' + encodeURI(user.name);
        const opts = {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            signed: true,
            httpOnly: false,
        };
        try {
            ctx.cookies.set(ctx.app.config.auth_cookie_name, auth_name, opts);
        } catch (error) {
            ctx.body = {
            status: -1,
            messg: "系统繁忙请重试"
            };
            ctx.cookies.set(ctx.app.config.auth_cookie_name, null);
            return;
        }
        return ctx.body = {
            status: 0,
            user: user
        };
    }
}

module.exports = LoginController;