'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
  async index() {
    const { ctx } = this;
    const surveyId = ctx.query.surveyId;
    if(surveyId == undefined){
      ctx.status = 404;
      ctx.body = 'Please specify survey id';
      return;
    }
    else {
      await this.ctx.render('mobile/mobileSurvey.html');
    }
  }

  async mobileSurveySuccess() {
    const { ctx } = this;
    const surveyID = ctx.query.surveyID;
    if(surveyID == undefined){
      ctx.status = 404;
      ctx.body = 'Please specify survey id';
      return;
    }
    else {
      await this.ctx.render('mobile/mobileSurveySuccess.html');
    }
  }

  async getSurveyByID() {
    const { ctx } = this;
    const surveyID = ctx.request.body.surveyID;
    var tmp_result = await ctx.service.survey.mobile.surveyDetails(surveyID);
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

  async answerSurvey() {
    const { ctx } = this;
    const result = await ctx.service.survey.mobile.answerSurvey(ctx.request.body.answer, ctx.request.ip);
    if (result == -1) {
      // unexpected error
      ctx.body = {
        code: 405,
        messg: "未知错误"
      };
    }
    else if (result == -2) {
      // no such surveyID
      ctx.body = {
        code: 405,
        messg: "此 surveyID 不存在"
      };
    }
    else if (result == -3) {
      // exec transaction error
      ctx.body = {
        code: 405,
        messg: "执行事务出错"
      };
    }
    else if (result == 0) {
      // success
      ctx.body = {
        code: 200,
        messg: "填写成功"
      };
    }
    else {
      // unexpected error
      ctx.body = {
        code: 405,
        messg: "未知错误"
      };
    }
  }
}

module.exports = IndexController;