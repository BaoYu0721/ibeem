'use strict';

const Controller = require('egg').Controller;

class StatisticsController extends Controller {
    async surveyStatistics(){
        const { ctx } = this;
        const surveyID = ctx.request.body.surveyID;
        const beginTime = ctx.request.body.beginTime;
        const endTime = ctx.request.body.endTime;
        const relation = ctx.request.body.relation;
        const objectID = ctx.request.body.objectID;
        // console.log('surveyID:' + surveyID + ', objectID:' + objectID + ', relation:' + relation + ', beginTime:' + beginTime + ', endTime:' + endTime);
        const result = await ctx.service.survey.statistics.surveyStatistics(surveyID, objectID, relation, beginTime, endTime);
        if (result == -1){
            ctx.body = {
                messg: "统计问卷情况出现异常！",
                code: 1005
            };
        }
        else if (result == -2) {
            ctx.body = {
                messg: "没有此 survey id !",
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