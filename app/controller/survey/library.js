'use strict';

const Controller = require('egg').Controller;

class LibraryController extends Controller {
    async libraryAdd(){
        const { ctx } = this;
        const reqData = ctx.request.body;
        const result = await ctx.service.survey.library.libraryAdd(reqData);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }else if(result == 0){
            return ctx.body = {
                code: 200
            };
        }
    }
}

module.exports = LibraryController