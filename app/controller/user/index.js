'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
  async index() {
    await this.ctx.render('manage/home.html');
  }

  async userInfo() {
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

  async changePassword(){
    const { ctx } = this;
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
    const userId = user.split('^_^')[0];
    const newPassword = ctx.request.body.password;
    const result = await ctx.service.user.index.changePassword(userId, newPassword);
    if(result != -1 && result != null){
        ctx.body = {
            code: 200,
        };
    }else{
        ctx.body = {
            code: 1004,
            messg: "修改密码失败!"
        }
    }
  }

  async changeInfo(){
    const { ctx } = this;
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
    const userId = user.split('^_^')[0];
    const name = ctx.request.body.name;
    const workplace = ctx.request.body.workplace;
    const position = ctx.request.body.position;
    const email = ctx.request.body.email;
    const mobilePhone = ctx.request.body.mobilePhone;
    const portrait = ctx.request.body.portrait;
    const result = await this.ctx.service.user.index.changeInfo(userId, name, workplace, position, email, mobilePhone, portrait);
    if(result == -1 || result == null){
        return ctx.body = {
            messg: "修改信息失败",
            code: 1003
        };
    }
    ctx.body = {
        code: 200
    };
  }
}

module.exports = IndexController;