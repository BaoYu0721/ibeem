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
    }else if(item == "assessment"){
      await this.ctx.render('manage/deviceEvaluate.html');
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
      return ctx.body = {
        code: 200,
        page: device
      };
    }else{
      return ctx.body = {
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

  async deviceInfo(){
    const { ctx } = this;
    const deviceId = ctx.request.body.deviceID;
    const result = await ctx.service.device.index.deviceInfo(deviceId);
    if(result == -1){
      return ctx.body = {
        code: 1005,
        messg: "系统繁忙，请重试"
      }
    }
    return ctx.body = {
      code: 200,
      device: result
    };
  }

  async deviceUpdate(){
    const { ctx } = this;
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
    const userId = user.split('^_^')[0];
    const id = ctx.request.body.id;
    const address = ctx.request.body.address;
    const describe = ctx.request.body.describe;
    const image = ctx.request.body.image;
    const wechat = ctx.request.body.wechat;
    const warning = ctx.request.body.warning;
    const memo = ctx.request.body.memo;
    const deviceInfo = {
      id: id,
      address: address,
      describe: describe,
      image: image,
      wechat: wechat,
      warning: warning,
      memo: memo,
    };
    const result = await ctx.service.device.index.deviceUpdate(userId, deviceInfo);
    if(result == -1){
      return ctx.body = {
        code: 1005,
        messg: "系统繁忙，请重试"
      };
    }else if(result == -2){
      return ctx.body = {
        code: 1003,
        messg: "您不是该设备拥有者，没有权限修改该设备"
      };
    }
    deviceInfo.code = 200;
    return ctx.body = deviceInfo;
  }
}

module.exports = IndexController;