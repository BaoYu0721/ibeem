'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index(){
        await this.ctx.render('administrator/output.html');
    }

    async deviceList(){
        const { ctx } = this;
        const result = await ctx.service.admin.export.deviceList();
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            arrayList: result,
            code: 200
        };
    }

    async workOrderList(){
        const { ctx } = this;
        const result = await ctx.service.admin.export.workOrderList();
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }
}

module.exports = IndexController;