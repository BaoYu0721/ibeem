'use strict';

const Controller = require('egg').Controller;

class IncreaseController extends Controller {
    async projectIncrease(){
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const projectName = ctx.request.body.projectName;
        const describe = ctx.request.body.describe;
        const image = ctx.request.body.image;
        const result = await ctx.service.project.increase.projectIncrease(userId, projectName, describe, image);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == -2){
            return ctx.body = {
                messg: "添加失败，项目名称重复",
                code: 1001
            };
        }else if(result == 0){
            return ctx.body = {
                code: 200
            };
        }
    }
}

module.exports = IncreaseController;