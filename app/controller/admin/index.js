'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index(){
        await this.ctx.render('administrator/index.html');
    }

    async getDeviceDataCountList(){
        const { ctx } = this;
        const result = await ctx.service.admin.index.getDeviceDataCountList();
        if(result == -1){
            return ctx.body = {
                code: 1005,
            }
        }
        ctx.body = {
            code: 200,
            list: result
        }
    }

    async getCount(){
        const { ctx } = this;
        const result = await ctx.service.admin.index.getCount();
        if(result == -1){
            return ctx.body = {
                code: 1005,
            }
        }
        ctx.body = {
            code: 200,
            mysqlSize: result.mysqlSize,
            mongodbSize: result.mongodbSize,
            deviceDataCount: result.deviceDataCount,
            surveyCount: result.surveyCount,
            deviceCount: result.deviceCount,
            buildingCount: result.buildingCount,
            userCount: result.userCount
        };
    }
}

module.exports = IndexController;