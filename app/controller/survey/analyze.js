'use strict';

const Controller = require('egg').Controller;

class AnalyzeController extends Controller {
    async getDimension() {
        const { ctx } = this;
        const surveyID = ctx.request.body.surveyID;
        const result = await ctx.service.survey.analyze.getDimension(surveyID);
        if (result == -1) {
            ctx.body = {
                code: 405,
                messg: "getDimension发生未知错误"
            };
        }
        else {
            ctx.body = {
                projectList: result,
                code: 200
            };
        }
    }

    async analysisSurvey() {
        const { ctx } = this;
        const surveyID = ctx.request.body.surveyID;
        const zid = ctx.request.body.zid;
        const yid = ctx.request.body.yid;
        const type = ctx.request.body.type;
        const startTime = ctx.request.body.startTime;
        const endTime = ctx.request.body.endTime;
        const relation = ctx.request.body.relation;
        const objectID = ctx.request.body.objectID;

        const result = await ctx.service.survey.analyze.analysisSurvey(surveyID, zid, yid, type, startTime, endTime, relation, objectID);
        if (result == -1) {
            ctx.body = {
                code: 405,
                messg: "analysisSurvey发生未知错误"
            };
        }
        else {
            ctx.body = {
                code: 200,
                result: result
            };
        }
    }
}

module.exports = AnalyzeController;