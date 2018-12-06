'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index(){
        await this.ctx.render('administrator/surveyListDevice_manage.html');
    }

    async surveyList(){
        const { ctx } = this;
        const result = await ctx.service.admin.survey.surveyList();
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