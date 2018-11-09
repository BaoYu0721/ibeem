'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
  async index() {
    const { ctx } = this;
    const item = ctx.query.item;
    if(item == undefined){
      await this.ctx.render('manage/surveyListDevice.html');
    }else if(item == 'increase'){
      await this.ctx.render('manage/surveyAdd.html');
    }else if(item == 'analyze'){
      await this.ctx.render('manage/surveyAnalysis.html');
    }else if(item == 'library'){
      await this.ctx.render('manage/surveyLibrary.html');
    }else if(item == 'statistics'){
      await this.ctx.render('manage/surveyReport.html');
    }else{
      ctx.status = 403;
      ctx.body = 'forbidden!';
      return;
    }
  }

  async surveyList() {
    const { ctx } = this;
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
    const userId = user.split('^_^')[0];
    const survey = await ctx.service.survey.index.surveyList(userId);
    if(survey != -1){
      ctx.body = {
        list: survey,
        code: 200
      };
    }else{
      ctx.body = {
        code: 1005,
        messg: "系统繁忙请重试"
      };
    }
  }

  async questionList() {
    const { ctx } = this;
    const result = await ctx.service.survey.index.questionList();
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
}

module.exports = IndexController;