'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index(){
        await this.ctx.render('administrator/deviceList_manage.html');
    }

    async deviceList(){
        const { ctx } = this;
        const page = parseInt(ctx.request.body.pageNo);
        const pageSize = 50;
        const device = await ctx.service.admin.device.deviceList(page, pageSize);
        if(device != -1){
            return ctx.body = {
                code: 200,
                page: device
            };
        }else{
            return ctx.body = {
                code: 1005,
                messg: "系统繁忙，请重试",
            };
        }
    }
}

module.exports = IndexController;