'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
  async index(){
    const { ctx } = this;
    const projectName = ctx.query.project_name;
    const item = ctx.query.item;
    const to = ctx.query.to;
    if(projectName == undefined){
      await this.ctx.render('manage/teamList.html');
    }else if(projectName != undefined && item == undefined){
      return ctx.render('manage/teamContent.html', {
        project_name: projectName
      });
    }else if(projectName != undefined && item == 'building'){
      return ctx.render('manage/teamBuilding.html', {
        project_name: projectName
      });
    }else if(projectName != undefined && item == 'device'){
      if(to == 'download'){
        return ctx.render('manage/new_compareTeamDeviceData.html', {
          project_name: projectName
        });
      }
      return ctx.render('manage/teamDevice.html', {
        project_name: projectName
      });
    }else if(projectName != undefined && item == 'survey'){
      return ctx.render('manage/surveyListTeam.html', {
        project_name: projectName
      });
    }else if(projectName != undefined && item == 'member'){
      return ctx.render('manage/teamMember.html', {
        project_name: projectName
      });
    }else{
      ctx.status = 403;
      ctx.body = 'forbidden!';
      return;
    }
  }

  async single(){
  }

  async projectList() {
    const { ctx } = this;
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
    const userId = user.split('^_^')[0];
    const project = await ctx.service.project.index.projectList(userId);
    if(project != -1){
      ctx.body = {
        code: 200,
        list: project
      };
    }else{
      ctx.body = {
        code: 1005,
        messg: "系统繁忙，请重试"
      }
    }
  }
}

module.exports = IndexController;