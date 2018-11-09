'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    await this.ctx.render('manage/main.html');
  }

  async buildingList() {
    const { ctx } = this;
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
    const userId = user.split('^_^')[0];
    const building = await ctx.service.index.buildingList(userId);
    if(building != -1){
        return ctx.body = {
            list: building,
            code: 200
        };
    }else{
        return ctx.body = {
            code: 1005,
            messg: "系统繁忙请重试"
        }
    }
  }

  async deviceList() {
    const { ctx } = this;
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
    const userId = user.split('^_^')[0];
    const device = await ctx.service.index.deviceList(userId);
    if(device != -1){
      ctx.body = {
        list: device,
        code: 200
      };
    }else{
      ctx.body = {
        code: 1005,
        messg: "系统繁忙，请重试"
      };
    }
  }

  async surveyList() {
    const { ctx } = this;
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
    const userId = user.split('^_^')[0];
    const answer = await ctx.service.index.surveyList(userId);
    if(answer != -1){
        ctx.body = {
            code: 200,
            list: answer
        }
    }else{
        ctx.body = {
            code: 1005,
            list: "系统繁忙请重试"
        }
    }
  }
}

module.exports = HomeController;