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
}

module.exports = IndexController;