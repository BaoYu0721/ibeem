'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index(){
        const { ctx } = this;
        const item = ctx.query.item;
        if(item == undefined){
            await this.ctx.render('administrator/surveyListDevice_manage.html');
        }else if(item == 'increase'){
            await this.ctx.render('administrator/surveyAdd.html');
        }else if(item == 'analyze'){
            await this.ctx.render('administrator/surveyAnalysis_manage.html');
        }else if(item == 'statistics'){
            await this.ctx.render('administrator/surveyReport_manage.html');
        }else if (item == 'mobileSurvey') {
            await this.ctx.render('mobile/mobileSurvey.html');
        }else{
            ctx.status = 403;
            ctx.body = 'forbidden!';
            return;
        }
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

    async surveyDownloadAnswer(){
        const { ctx } = this;
        const surveyId = ctx.request.body.surveyID;
        const sTime = ctx.request.body.startTime;
        const eTime = ctx.request.body.endTime;
        const relation = ctx.request.body.relation;
        const pbId = ctx.request.body.objectID;
        const result = await ctx.service.admin.survey.surveyDownloadAnswer(surveyId, sTime, eTime, relation, pbId);
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

    async surveyDownloadQuestion(){
        const { ctx } = this;
        const surveyId = ctx.request.body.surveyID;
        const result = await ctx.service.admin.survey.surveyDownloadQuestion(surveyId);
        if(result == -1){
          return ctx.body = {
            messg: "系统繁忙请重试",
            code: 1005
          }
        }
        ctx.body = result;
    }

    async getSurveyById() {
        const { ctx } = this;
        const surveyID = ctx.request.body.surveyID;
        var tmp_result = await ctx.service.admin.survey.getSurveyById(surveyID);
        if (tmp_result == -1) {
          ctx.response.body = 'select from database error!';
          ctx.status = 404;
          return;
        }
        else if (tmp_result == -2) {
          // no proper survey
          ctx.response.body = 'no proper survey!';
          ctx.status = 404;
          return;
        }
        else {
          var result_map = tmp_result;
          // ctx.response.body = '';
          // ctx.status = 404;
          ctx.response.body = JSON.stringify(result_map);
          ctx.status = 200;
        }
    }

    async getDimension(){
        const { ctx } = this;
        const surveyID = ctx.request.body.surveyID;
        const result = await ctx.service.admin.survey.getDimension(surveyID);
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

    async analysisSurvey(){
        const { ctx } = this;
        const surveyID = ctx.request.body.surveyID;
        const zid = ctx.request.body.zid;
        const yid = ctx.request.body.yid;
        const type = ctx.request.body.type;
        const startTime = ctx.request.body.startTime;
        const endTime = ctx.request.body.endTime;
        const relation = ctx.request.body.relation;
        const objectID = ctx.request.body.objectID;

        const result = await ctx.service.admin.survey.analysisSurvey(surveyID, zid, yid, type, startTime, endTime, relation, objectID);
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

    async surveyStatistics(){
        const { ctx } = this;
        const surveyID = ctx.request.body.surveyID;
        const beginTime = ctx.request.body.beginTime;
        const endTime = ctx.request.body.endTime;
        const relation = ctx.request.body.relation;
        const objectID = ctx.request.body.objectID;
        // console.log('surveyID:' + surveyID + ', objectID:' + objectID + ', relation:' + relation + ', beginTime:' + beginTime + ', endTime:' + endTime);
        const result = await ctx.service.admin.survey.surveyStatistics(surveyID, objectID, relation, beginTime, endTime);
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

    async questionList(){
        const { ctx } = this;
        const result = await ctx.service.admin.survey.questionList();
        if(result != -1){
            ctx.body = {
                list: result,
                code: 200
            };
        }else{
            ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
    }

    async questionSelect(){
        const { ctx } = this;
        const questionId = ctx.request.body.id;
        const result = await ctx.service.admin.survey.questionSelect(questionId);
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

    async commit() {
        const { ctx } = this;
        const survey = JSON.parse(ctx.request.body.survey);
        if(JSON.stringify(survey) != '{}'){
          const result = await ctx.service.admin.survey.commit(survey);
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

    async updateSurvey(){
        const { ctx } = this;
        // console.log(ctx.request.body.surveyID);
        // console.log(JSON.stringify(ctx.request.body.survey));
        const result = await ctx.service.admin.survey.updateSurvey(ctx.request.body.surveyID, ctx.request.body.survey);
        if (result == -1) {
          // no such surveyID
          ctx.body = {
            messg: "此surveyID不存在",
            code: 405,
          };
        }
        else if (result == -2) {
          // unexpected error
          ctx.body = {
            messg: "未知错误",
            code: 405,
          };
        }
        else if (result == -3) {
          // exec transaction error!
          ctx.body = {
            messg: "执行更新survey事务出错",
            code: 405,
          };
        }
        else if (result == 0) {
          // complete normally
          ctx.body = {
            code: 200
          };
        }
        else {
          // unexpected error!
          ctx.body = {
            messg: "未知错误",
            code: 405,
          };
        }
    }

    async surveyDelete(){
        const { ctx } = this;
        const surveyId = ctx.request.body.surveyID;
        const result = await ctx.service.admin.survey.surveyDelete(surveyId);
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

module.exports = IndexController;