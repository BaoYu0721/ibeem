'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
  async index() {
    await this.ctx.render('manage/home.html');
  }

  async manageInfo() {
    const { ctx } = this;
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
    const userId = user.split('^_^')[0];
    const userData = await ctx.service.user.index.manageInfo(userId);
    if(userData != -1 && userData != null){
        ctx.body = {
            code: 200,
            user: userData
        };
    }else{
        ctx.body = {
            code: 1004,
            messg: "查询个人信息失败"
        }
    }
  }
}

module.exports = IndexController;