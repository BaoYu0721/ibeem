'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index(){
        const { ctx } = this;
        const projectName = ctx.query.project_name;
        const item = ctx.query.item;
        const buildingName = ctx.query.building_name;
        const topBuildingName = ctx.query.top_building_name;
        const to = ctx.query.to;
        const op = ctx.query.op;
        const go = ctx.query.go;
        if(projectName){
            if(item == 'building'){
                if(buildingName){
                    if(op == "info"){
                        return await ctx.render('administrator/teamBuildingData.html', {
                            projectName: projectName,
                            buildingName: buildingName? buildingName: topBuildingName
                        });
                    }else if(op == "point"){
                        if(go == "detail"){
                            return await ctx.render('administrator/teamBuildingPointDetail.html', {
                                projectName: projectName,
                                buildingName: buildingName
                            });
                        }
                        return await ctx.render('administrator/teamBuildingPoint.html', {
                            projectName: projectName,
                            buildingName: buildingName
                        });
                    }else if(op == "survey"){
                        return await ctx.render('administrator/surveyListBuilding.html', {
                            projectName: projectName,
                            buildingName: buildingName
                        });
                    }else if(op == "energy"){
                        return await ctx.render('administrator/teamBuildingConsumption.html', {
                            projectName: projectName,
                            buildingName: buildingName
                        });
                    }
                    return await ctx.render('administrator/teamBuildingContent.html', {
                        projectName: projectName,
                        buildingName: buildingName
                    });
                }
                if(topBuildingName){
                    if(topBuildingName){
                        return ctx.render('administrator/teamBuildingTop.html', {
                          projectName: projectName,
                          topBuildingName: topBuildingName
                        });
                    }
                }
                return await ctx.render('administrator/teamBuilding.html',{
                    projectName: projectName
                });
            }else if(item == 'device'){
                if(to == 'download' || to == 'compare' || to == 'view'){
                    return ctx.render('administrator/new_compareTeamDeviceData.html', {
                        project_name: projectName
                    });
                }
                return await ctx.render('administrator/teamDevice.html',{
                    projectName: projectName
                });
            }else if(item == 'survey'){
                if(to == "analysis"){
                    return ctx.render('administrator/surveyAnalysisTeam.html', {
                        projectName: projectName
                    });
                }else if(to == "statistics"){
                    return ctx.render('administrator/surveyReportTeam.html', {
                        projectName: projectName
                    });
                }
                return await ctx.render('administrator/surveyListTeam.html',{
                    projectName: projectName
                });
            }else if(item == 'member'){
                return await ctx.render('administrator/teamMember.html',{
                    projectName: projectName
                });
            }
            return await ctx.render('administrator/teamContent.html',{
                projectName: projectName
            });
        }
        await ctx.render('administrator/teamList.html');
    }

    async projectList(){
        const { ctx } = this;
        const result = await ctx.service.admin.project.projectList();
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleInfo(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleInfo(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == -2){
            return  ctx.body = {
                messg: "该项目已被删除",
                code: 4005
            };
        }
        ctx.body = {
            project: result,
            code: 200
        };
    }

    async singleDeviceInfo(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleDeviceInfo(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == -2){
            return  ctx.body = {
                messg: "该项目已被删除",
                code: 4005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleSurveyInfo(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleSurveyInfo(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == -2){
            return  ctx.body = {
                messg: "该项目已被删除",
                code: 4005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleBuildingInfo(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleBuildingInfo(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleEdit(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const name = ctx.request.body.name;
        const describe = ctx.request.body.describe;
        const image = ctx.request.body.image;
        const result = await ctx.service.admin.project.singleEdit(projectId, name, describe, image);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1003
            }; 
        }else if(result == -2){
            return ctx.body = {
                messg: "项目名已存在!",
                code: 1005
            }; 
        }else if(result == 0){
            return ctx.body = {
                code: 200
            };
        }
    }

    async singleDelete(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleDelete(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            }; 
        }else if(result == 0 || result == null){
            return ctx.body = {
                code: 200
            };
        }
    }

    async singleBuilding(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleBuilding(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == -2){
            return  ctx.body = {
                messg: "该建筑已被删除",
                code: 4005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleDevice(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleDevice(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == -2){
            return  ctx.body = {
                messg: "该项目已被删除",
                code: 4005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleSurvey(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleSurvey(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == -2){
            return  ctx.body = {
                messg: "该项目已被删除",
                code: 4005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleMember(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleMember(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == -2){
            return  ctx.body = {
                messg: "该项目已被删除",
                code: 4005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleBuildingAdd(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const buildingName = ctx.request.body.name;
        const buildingType = ctx.request.body.buildingType;
        if(buildingType == '1'){
            const buildingClass = ctx.request.body.buildingClass;
            const city = ctx.request.body.city;
            const longitude = ctx.request.body.longitude;
            const latitude = ctx.request.body.latitude;
            const climatic = ctx.request.body.climaticProvince;
            const result = await ctx.service.admin.project.ibeemBuildingAdd(projectId,
                buildingName, buildingClass, city, longitude, latitude, climatic);
            if(result == 0){
                return ctx.body = {
                    code: 200
                }
            }else if(result == -1){
                return ctx.body = {
                    messg: "系统繁忙，请重试",
                    code: 1005
                };
            }
        }else if(buildingType == '2'){
            const result = await ctx.service.admin.project.topBuildingAdd(projectId, buildingName);
            if(result == 0){
                return ctx.body = {
                    code: 200
                }
            }else if(result == -1){
                return ctx.body = {
                    messg: "系统繁忙，请重试",
                    code: 1005
                };
            }
        }
    }

    async singleBuildingImport(){
        const { ctx } = this;
        const projectId = ctx.query.projectID;
        const type = ctx.query.type;
        const filepath = ctx.request.files[0].filepath;
        const fileCheck = filepath.split('.');
        if(fileCheck[fileCheck.length - 1] != 'xlsx'){
            return ctx.body = {
                code: 1001
            };
        }
        const xlsx = ctx.helper.parseXlsx(filepath);
        if(type == '1'){
            const sheet1 = xlsx[0].data;
            if(!sheet1[0][22] || sheet1[0][22].replace(/^\s+|\s+$/g, '') != '备注'){
                return ctx.body = {
                    code: 1001
                };
            }
            if(sheet1.length == 1){
                return ctx.body = {
                    code: 1000
                };
            }
            const result = await ctx.service.admin.project.buildingImportType1(projectId, xlsx);
            if(result == -1){
                return ctx.body = {
                    code: 1005
                }
            }
            return ctx.body = {
                code: 200
            }
        }else if(type == '2'){
            const sheet2 = xlsx[0].data;
            if(!sheet2[0][20] || sheet2[0][20].replace(/^\s+|\s+$/g, '') != '备注'){
                return ctx.body = {
                    code: 1001
                };
            }
            if(sheet2.length == 1){
                return ctx.body = {
                    code: 1000
                };
            }
            const result = await ctx.service.admin.project.buildingImportType2(projectId, xlsx);
            if(result == -1){
                return ctx.body = {
                    code: 1005
                }
            }
            return ctx.body = {
                code: 200
            }
        }else if(type == '3'){
            const buildingName = ctx.query.buildingName;
            const result = await ctx.service.admin.project.buildingImportType3(projectId, xlsx, buildingName);
            if(result == -1){
                return ctx.body = {
                    code: 1005
                }
            }
            return ctx.body = {
                code: 200
            }
        }
    }

    async singleBuildingDelete(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.admin.project.singleBuildingDelete(buildingId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleBuildingView(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.admin.project.singleBuildingView(buildingId);
        if(result == -1 || result == null){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            building: result,
            code: 200
        };
    }

    async singleBuildingInformation(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.admin.project.singleBuildingInformation(buildingId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            building: result,
            code: 200
        };
    }

    async singleBuildingPoint(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.admin.project.singleBuildingPoint(buildingId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleBuildingPointData(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceId;
        const result = await ctx.service.admin.project.singleBuildingPointData(deviceId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            status: result.status,
            tem: result.tem,
            co2: result.co2,
            pm: result.pm,
            hum: result.hum,
            lightIntensity: result.lightIntensity,
            code: 200
        };
    }

    async singleBuildingSurvey(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.admin.project.singleBuildingSurvey(buildingId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleBuildingEnergy(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.admin.project.singleBuildingEnergy(buildingId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            energyConsumption: result,
            code: 200
        };
    }

    async singleBuildingSaveBaseInfo(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.admin.project.singleBuildingSaveBaseInfo(data);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleBuildingSaveDesignInfo(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.admin.project.singleBuildingSaveDesignInfo(data);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleBuildingSaveEnergyInfo(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.admin.project.singleBuildingSaveEnergyInfo(data);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleBuildingSaveIndoorInfo(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.admin.project.singleBuildingSaveIndoorInfo(data);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleBuildingSaveParameterInfo(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.admin.project.singleBuildingSaveParameterInfo(data);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleBuildingSaveWaterInfo(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.admin.project.singleBuildingSaveWaterInfo(data);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleBuildingPointDeviceDetail(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceId;
        var sTime = ctx.request.body.startTime;
        var eTime = ctx.request.body.endTime;
        const result = await ctx.service.admin.project.singleBuildingPointDeviceDetail(deviceId, sTime, eTime);
        if(result == -1){
            return ctx.body = {
                result: "error"
            };
        }else if(result == null){
            return ctx.body = {
                result: "success",
            };
        }else{
            return ctx.body = {
                result: "success",
                data: result.deviceData,
                deviceId: deviceId,
                deviceName: result.deviceName
            }
        }
    }

    async singleBuildingPointDelete(){
        const { ctx } = this;
        const buildingPointId = ctx.request.body.buildingPointID;
        const result = await ctx.service.admin.project.singleBuildingPointDelete(buildingPointId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleBuildingPointUpdate(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.admin.project.singleBuildingPointUpdate(data);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleBuildingPointInfo(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.admin.project.singleBuildingPointInfo(buildingId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleBuildingPointDeviceRelevant(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleBuildingPointDeviceRelevant(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleBuildingPointSurveyRelevant(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleBuildingPointSurveyRelevant(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleBuildingPointSurveyDetail(){
        const { ctx } = this;
        const surveyId = ctx.request.body.surveyID;
        const startTime = ctx.request.body.beginTime;
        const endTime = ctx.request.body.endTime;
        const relation = ctx.request.body.relation;
        const projectId = ctx.request.body.objectID;
        const result = await ctx.service.admin.project.singleBuildingPointSurveyDetail(surveyId, startTime, endTime, relation, projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            survey: result,
            code: 200
        };
    }

    async singleBuildingSurveyAdd(){
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.admin.project.singleBuildingSurveyAdd(userId, buildingId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleBuildingSurveyBind(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const surveyId = ctx.request.body.surveyID;
        const result = await ctx.service.admin.project.singleBuildingSurveyBind(buildingId, surveyId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleBuildingEnergyUpdate(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.admin.project.singleBuildingEnergyUpdate(data);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleMemberSearch(){
        const { ctx } = this;
        const key = ctx.request.body.key;
        const projectId = ctx.request.body.projectId;
        const result = await ctx.service.admin.project.singleMemberSearch(key, projectId);
        if(result == -1){
            return ctx.body = {
                messg: "查询用户失败，请重试",
                code: 1004
            };
        }
        ctx.body = {
            arrayList: result,
            code: 200
        };
    }

    async singleMemberAdd(){
        const { ctx } = this;
        const userId = ctx.request.body.userID;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleMemberAdd(userId, projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleMemberDelete(){
        const { ctx } = this;
        const userId = ctx.request.body.userID;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleMemberDelete(userId, projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙",
                code: 1002
            };
        }else if(result == -2){
            return ctx.body = {
                messg: "您不是项目创建者,无权删除其他管理员",
                code: 1002
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleMemberSetManager(){
        const { ctx } = this;
        const userId = ctx.request.body.userID;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleMemberSetManager(userId, projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleMemberManagerRevocation(){
        const { ctx } = this;
        const userId = ctx.request.body.userID;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleMemberManagerRevocation(userId, projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }else if(result == -2){
            return ctx.body = {
                messg: "您不是项目创建者,无权撤销其他管理员",
                code: 1002
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleTopBuilding(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingId;
        const result = await ctx.service.admin.project.singleTopBuilding(buildingId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            topBuilding: result,
            code: 200
        };
    }

    async singleTopBuildingRoomInfo(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingId;
        const result = await ctx.service.admin.project.singleTopBuildingRoomInfo(buildingId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            result: result,
            code: 200
        };
    }

    async singleSurveySearch(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleSurveySearch(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙请重试",
                code: 1005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    
    async singleDeviceSearch(){
        const { ctx } = this;
        const result = await ctx.service.admin.project.singleDeviceSearch();
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            list: result,
            code: 200
        };
    }

    async singleDeviceAdd(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const ids = ctx.request.body.ids.split(',');
        const result = await ctx.service.admin.project.singleDeviceAdd(projectId, ids);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == 0){
            ctx.body = {
                code: 200
            };
        }
    }

    async singleDeviceRecycle(){
        const { ctx } = this;
        const ids = ctx.request.body.ids.split(',');
        const result = await ctx.service.admin.project.singleDeviceRecycle(ids);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }else if(result == 0){
            ctx.body = {
                code: 200
            };
        }
    }

    async singleDeviceAttention(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.admin.project.singleDeviceAttention(projectId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            user: result,
            code: 200
        };
    }

    async singleAddDeviceAttention(){
        const { ctx } = this;
        const dids = ctx.request.body.ids;
        const uid = ctx.request.body.userID;
        const result = await ctx.service.admin.project.singleAddDeviceAttention(dids, uid);
        if(result == -1){
            return ctx.body = {
                messg: "未知错误!",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async singleDeviceRelieve(){
        const { ctx } = this;
        const ids = ctx.request.body.deviceID.split(',');
        const result = await ctx.service.admin.project.singleDeviceRelieve(ids);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        ctx.body = {
            code: 200
        };
    }
}

module.exports = IndexController;