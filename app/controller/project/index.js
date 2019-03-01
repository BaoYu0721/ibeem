'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
  async index(){
    const { ctx } = this;
    const projectName = ctx.query.project_name;
    const item = ctx.query.item;
    const to = ctx.query.to;
    const buildingName = ctx.query.building_name;
    const topBuildingName = ctx.query.top_building_name;
    const operation = ctx.query.op;
    const go = ctx.query.go;
    if(projectName == undefined){
      await this.ctx.render('manage/teamList.html');
    }else if(projectName != undefined && item == undefined){
      return ctx.render('manage/teamContent.html', {
        project_name: projectName
      });
    }else if(projectName != undefined && item == 'building'){
      if(buildingName != undefined){
        if(operation == "info"){
          return ctx.render('manage/teamBuildingData.html', {
            project_name: projectName,
            buildingName: buildingName
          });
        }else if(operation == "point"){
          if(go == 'detail'){
            return ctx.render('manage/teamBuildingPointDetail.html', {
              project_name: projectName,
              buildingName: buildingName
            });
          }
          return ctx.render('manage/teamBuildingPoint.html', {
            project_name: projectName,
            buildingName: buildingName
          });
        }else if(operation == "survey"){
          return ctx.render('manage/surveyListBuilding.html', {
            project_name: projectName,
            buildingName: buildingName
          });
        }else if(operation == "energy"){
          return ctx.render('manage/teamBuildingConsumption.html', {
            project_name: projectName,
            buildingName: buildingName
          });
        }
        return ctx.render('manage/teamBuildingContent.html', {
          project_name: projectName,
          buildingName: buildingName
        });
      }
      if(topBuildingName != undefined){
        if(operation == "point"){
          if(go == 'detail'){
            return ctx.render('manage/teamBuildingPointDetail.html', {
              project_name: projectName,
              buildingName: null,
              topBuildingName: topBuildingName
            });
          }
          return ctx.render('manage/teamBuildingPoint.html', {
            project_name: projectName,
            buildingName: null,
            topBuildingName: topBuildingName
          });
        }else if(operation == "survey"){
          return ctx.render('manage/surveyListBuilding.html', {
            project_name: projectName,
            buildingName: null,
            topBuildingName: topBuildingName
          });
        }else if(operation == "energy"){
          return ctx.render('manage/teamBuildingConsumption.html', {
            project_name: projectName,
            buildingName: null,
            topBuildingName: topBuildingName
          });
        }
        return ctx.render('manage/teamBuildingTop.html', {
          project_name: projectName,
          buildingName: null,
          topBuildingName: topBuildingName
        });
      }
      return ctx.render('manage/teamBuilding.html', {
        project_name: projectName
      });
    }else if(projectName != undefined && item == 'device'){
      if(to == 'download' || to == 'compare' || to == 'view'){
        return ctx.render('manage/new_compareTeamDeviceData.html', {
          project_name: projectName
        });
      }
      return ctx.render('manage/teamDevice.html', {
        project_name: projectName
      });
    }else if(projectName != undefined && item == 'survey'){
      if(to == "analysis"){
        return ctx.render('manage/surveyAnalysisTeam.html', {
          project_name: projectName
        });
      }else if(to == "statistics"){
        return ctx.render('manage/surveyReportTeam.html', {
          project_name: projectName
        });
      }
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

  async buildingExport(){
    const { ctx } = this;
    const buildingId = ctx.query.buildingId;
    const building = await ctx.service.project.index.buildingExport(buildingId);
    const filename = new Date().getTime().toString() + '.xlsx';
    ctx.set("Content-Disposition", "attachment;filename=" + filename);
    if(building == -1){
      return ctx.body = {
        messg: "系统繁忙请重试"
      };
    }
    const data = [];
    const keyMap = ["调研测试主体单位","所在课题","填写人","联系方式","建筑名称","建筑类型","地理位置","申报单位","参与单位","申报时间","采用标准","星级","标识类别","立项时间","竣工时间","运营时间","建筑面积(m2)","空调面积(m2)","建筑高度(m)","建筑朝向","建筑性质","建筑使用人数"];
    const valueMap = [];
    valueMap[0] = building['unit'];
    valueMap[1] = building['subject'];
    valueMap[2] = building['people'];
    valueMap[3] = building['contact'];
    valueMap[4] = building['name'];
    valueMap[5] = building['type'];
    valueMap[6] = building['address'];
    valueMap[7] = building['application_unit'];
    valueMap[8] = building['participant_organization'];
    valueMap[9] = building['time'] == null? '': ctx.helper.dateFormat(building['time']);
    valueMap[10] = building['adoption_standard'];
    valueMap[11] = building['level'];
    valueMap[12] = building['identifying'];
    valueMap[13] = building['project_time'] == null? '': ctx.helper.dateFormat(building['project_time']);
    valueMap[14] = building['completion_time'] == null? '': ctx.helper.dateFormat(building['completion_time']);
    valueMap[15] = building['service_time'] == null? '': ctx.helper.dateFormat(building['service_time']);
    valueMap[16] = building['building_area'] == null? '': building['building_area'];
    valueMap[17] = building['air_conditioning_area'] == null? '': building['air_conditioning_area'];
    valueMap[18] = building['height'] == null? '': building['height'];
    valueMap[19] = building['building_orientation'];
    valueMap[20] = building['building_property'];
    valueMap[21] = building['construction_use_number'] == null? '': building['construction_use_number'];
    valueMap[22] = building['remark'];
    data.push(keyMap);
    data.push(valueMap);
    ctx.body = ctx.helper.xlsxData(data);
  }
}

module.exports = IndexController;