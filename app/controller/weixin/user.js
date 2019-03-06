'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
    async index(){
        const { ctx } = this;
        const ticket = await ctx.service.utils.weixin.getTicket();
        if(ticket != -1){
            await ctx.render('mobile/index.html', {
                JsapiTicket: ticket
            });
        }else{
            ctx.body = {
                code: -1
            }
        }
    }

    async getUser(){
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const code   = ctx.query.code;
        const result = await ctx.service.weixin.user.getUser(userId, code);
        if(result == -1){
            return ctx.body = {
                code: 1005
            }
        }
        ctx.body = result;
    }
}

module.exports = UserController;