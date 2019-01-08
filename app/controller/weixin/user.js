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
}

module.exports = UserController;