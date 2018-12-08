'use strict';

const Controller = require('egg').Controller;

class IncreaseController extends Controller {

    async commit() {
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const survey = JSON.parse(ctx.request.body.survey);
        if(JSON.stringify(survey) != '{}'){
          const result = await ctx.service.survey.increase.commit(userId, survey);
          if(result == 0){
            ctx.body = {
              code: 200
            };
          }else if(result == -1){
            ctx.body = {
              messg: "系统繁忙，请重试",
              code: 1005,
            }
          }
        }else{
          ctx.body = {
            messg: "系统繁忙，请重试",
            code: 1005,
          }
        }
    }

    async questionSelect() {
        const { ctx } = this;
        const questionId = ctx.request.body.id;
        const result = await ctx.service.survey.increase.questionSelect(questionId);
        if(result != -1){
          ctx.body = {
            questionBank: result,
            code: 200
          };
        }else{
          ctx.body = {
            messg: "系统繁忙请重试",
            code: 1005
          };
        }
    }

    async updateSurvey() {
      const { ctx } = this;
      // console.log(ctx.request.body.surveyID);
      // console.log(JSON.stringify(ctx.request.body.survey));
      const result = await ctx.service.survey.increase.updateSurvey(ctx.request.body.surveyID, ctx.request.body.survey);
      if (result == -1) {
        // no such surveyID
      }
      else if (result == -2) {
        // unexpected error
      }
      else if (result == -3) {
        // exec transaction error!
      }
    }
}

module.exports = IncreaseController;