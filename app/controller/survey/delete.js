'use strict';

const Controller = require('egg').Controller;

class DeleteController extends Controller {
    async surveyDelete() {
        const { ctx } = this;
        const surveyId = ctx.request.body.surveyID;
        const result = await ctx.service.survey.delete.surveyDelete(surveyId);
        if(result == -1){
          ctx.body = {
            messg: "系统繁忙请重试",
            code: 1005
          };
        }else if(result == 0 || result == null){
          return ctx.body = {
            code: 200
          };
        }
    }
}

module.exports = DeleteController;