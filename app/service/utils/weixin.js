'use strict';

const Service = require('egg').Service;
var WexinData = require('../../../weixin');

class WenxinService extends Service {
    async getAccessToken(){
        const { ctx } = this;
        const current_time = new Date().getTime();
        const url = ctx.helper.formatBaseAccessToken(ctx.app.config.wexin.apiUrl.accessTokenApi, ctx.app.config.wexin.apiDomain, ctx.app.config.wexin.appId, ctx.app.config.wexin.appScrect);
        if(!WexinData.base_token.access_token || WexinData.base_token.expires_time < current_time){
            const result = await ctx.service.utils.http.wexinGet(url);
            if(result.errcode){
                return -1;
            }else{
                WexinData.base_token.access_token = result.access_token;
                WexinData.base_token.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 600) * 1000;
                ctx.helper.updateWeixinJson(WexinData);
            }
        }
        return WexinData.base_token.access_token;
    }

    async getTicket(){
        const { ctx } = this;
        const current_time = new Date().getTime();
        if(!WexinData.ticket_ob.ticket || WexinData.ticket_ob.expires_time < current_time){
            if(!WexinData.base_token.access_token || WexinData.base_token.expires_time < current_time){
                await this.getAccessToken();
            }
            const url = ctx.helper.formatTicket(ctx.app.config.wexin.apiUrl.ticketApi, ctx.app.config.wexin.apiDomain, WexinData.base_token.access_token);
            const result = await ctx.service.utils.http.wexinGet(url);
            if(result.errcode){
                return -1;
            }else{
                WexinData.ticket_ob.ticket = result.ticket;
                WexinData.ticket_ob.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 600) * 1000;
                ctx.helper.updateWeixinJson(WexinData);
            }
        }
        return WexinData.ticket_ob.ticket;
    }
}

module.exports = WenxinService;