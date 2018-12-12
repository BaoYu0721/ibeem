'use strict';

const Controller = require('egg').Controller;

class StatisticsController extends Controller {
    async surveyStatistics(){
        const { ctx } = this;
        const surveyId = ctx.request.body.surveyID;
        const startTime = ctx.request.body.beginTime;
        const endTime = ctx.request.body.endTime;
        const relation = ctx.request.body.relation;
        const projectId = ctx.request.body.objectID;
        const result = await ctx.service.survey.statistics.surveyStatistics(surveyId, startTime, endTime, relation, projectId);
        if(result == -1){
            ctx.body = {
                messg: "查询问卷情况错误",
                code: 1005
            };
        }
        else {
            ctx.body = {
                survey: result,
                code: 200
            };
        }
    }
}

module.exports = StatisticsController;