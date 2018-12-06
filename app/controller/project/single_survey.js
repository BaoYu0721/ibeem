'use strict';

const Controller = require('egg').Controller;

class SingleSurveyController extends Controller {
    async surveySearch(){
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.singleSurvey.surveySearch(userId, projectId);
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

    async surveyBind(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const surveyId = ctx.request.body.surveyID;
        const result = await ctx.service.project.singleSurvey.surveyBind(projectId, surveyId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }
}

module.exports = SingleSurveyController;