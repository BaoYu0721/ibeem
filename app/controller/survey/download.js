'use strict';

const Controller = require('egg').Controller;

class DownloadController extends Controller {
    async answer() {
        const { ctx } = this;
        const surveyId = ctx.request.body.surveyID;
        const sTime = ctx.request.body.startTime;
        const eTime = ctx.request.body.endTime;
        const relation = ctx.request.body.relation;
        const pbId = ctx.request.body.objectID;
        const result = await ctx.service.survey.download.answer(surveyId, sTime, eTime, relation, pbId);
        if(result != -1){
          ctx.body = {
            list: result,
            code: 200
          }
        }else{
          ctx.body = {
            messg: "系统繁忙请重试",
            code: 1005
          }
        }
    }

    async question() {
        const { ctx } = this;
        const surveyId = ctx.request.body.surveyID;
        const result = await ctx.service.survey.download.question(surveyId);
        if(result == -1){
          return ctx.body = {
            messg: "系统繁忙请重试",
            code: 1005
          }
        }
        ctx.body = result;
    }
}

module.exports = DownloadController;