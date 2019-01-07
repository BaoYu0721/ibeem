'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async getTicket(){
        const { ctx } = this;
        const ticket = await ctx.service.utils.weixin.getTicket();
        if(ticket == -1){
            ctx.body = {
                code: 1005
            };
        }
        ctx.body = {
            ticket: ticket,
            code: 200
        };
    }
}

module.exports = IndexController;