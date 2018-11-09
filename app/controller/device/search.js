'use strict';

const Controller = require('egg').Controller;

class SearchController extends Controller {
    async search(){
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const str = ctx.request.body.name;
        const device = await ctx.service.device.search.search(str, userId);
        if(device != -1){
          ctx.body = {
            list: device,
            code: 200
          };
        }else{
          ctx.body = {
            messg: "系统繁忙，请重试",
            code: 1005
          };
        }
    }
}

module.exports = SearchController;