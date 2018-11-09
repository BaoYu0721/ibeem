'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
  async index() {
    const { ctx } = this;
    const item = ctx.query.item;
    if(item == undefined){
      await this.ctx.render('manage/deviceList.html');
    }else if(item == 'download'){
      await this.ctx.render('manage/new_compareDeviceData.html');
    }else if(item == 'compare'){
      await this.ctx.render('manage/new_compareDeviceData.html');
    }else if(item == 'view'){
      await this.ctx.render('manage/new_compareDeviceDataOne.html')
    }else{
      ctx.status = 403;
      ctx.body = 'forbidden!';
      return;
    }
  }

  async pageList() {
    const { ctx } = this;
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
    const userId = user.split('^_^')[0];
    const page = parseInt(ctx.request.body.pageNo);
    const pageSize = 50;
    const device = await ctx.service.device.index.pageList(userId, page, pageSize);
    if(device != -1){
      ctx.body = {
        code: 200,
        page: device
      };
    }else{
      ctx.body = {
        code: 1005,
        messg: "系统繁忙，请重试",
      };
    }
  }

  async location() {
    const { ctx } = this;
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
    const userId = user.split('^_^')[0];
    const device = await ctx.service.device.index.location(userId);
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

  async parameter() {
    const { ctx } = this;
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
    const userId = user.split('^_^')[0];
    const dataParameter = await ctx.service.device.index.parameter(userId);
    if(dataParameter != -1){
      ctx.body = {
        dataParameter: dataParameter,
        code: 200
      };
    }else{
      ctx.body = {
        messg: "查找失败",
        code: 1005
      };
    }
  }
}

module.exports = IndexController;