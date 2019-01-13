'use strict';

const Controller = require('egg').Controller;
const fs = require('fs');

class SingleBuildingController extends Controller {
    async buildingIncrease(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const buildingName = ctx.request.body.name;
        const buildingType = ctx.request.body.buildingType;
        if(buildingType == '1'){
            const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
            const userId = user.split('^_^')[0];
            const buildingClass = ctx.request.body.buildingClass;
            const city = ctx.request.body.city;
            const longitude = ctx.request.body.longitude;
            const latitude = ctx.request.body.latitude;
            const climatic = ctx.request.body.climaticProvince;
            const result = await ctx.service.project.singleBuilding.ibeemBuildingIncrease(userId, projectId,
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
            const result = await ctx.service.project.singleBuilding.topBuildingIncrease(projectId, buildingName);
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

    async buildingImport(){
        const { ctx } = this;
        const projectId = ctx.query.projectID;
        const type = ctx.query.type;
        const filepath = ctx.request.files[0].filepath;
        const xlsx = ctx.helper.parseXlsx(filepath);
        if(type == '1'){
            const sheet1 = xlsx[0].data;
            if(sheet1.length > 1 && sheet1[0][4].replace(/^\s+|\s+$/g, '')
 == '项目名称'){
                console.log(sheet1);
            }
        }else if(type == '2'){
            console.log('2');
        }else if(type == '3'){
            const buildingName = ctx.query.buildingName;
        }
    }

    async buildingDelete(){
        const { ctx } = this;
        const type = ctx.request.body.type;
        if(type == 'ibeem'){
            const buildingId = ctx.request.body.buildingID;
            const result = await ctx.service.project.singleBuilding.ibeemBuildingDelete(buildingId);
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
        }else if(type == 'top'){
            const buildingId = ctx.request.body.topBuildingID;
            const result = await ctx.service.project.singleBuilding.topBuildingDelete(buildingId);
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
        }else{
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
    }

    async buildingView(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.project.singleBuilding.buildingView(buildingId);
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

    async buildingInfomation(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.project.singleBuilding.buildingInfomation(buildingId);
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

    async buildingPoint(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.project.singleBuilding.buildingPoint(buildingId);
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

    async buildingPointData(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceId;
        const result = await ctx.service.project.singleBuilding.buildingPointData(deviceId);
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

    async buildingSurvey(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.project.singleBuilding.buildingSurvey(buildingId);
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

    async buildingEnergy(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.project.singleBuilding.buildingEnergy(buildingId);
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

    async buildingSaveBaseInfo(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.project.singleBuilding.buildingSaveBaseInfo(data);
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

    async buildingSaveDesignInfo(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.project.singleBuilding.buildingSaveDesignInfo(data);
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

    async buildingSaveEnergyInfo(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.project.singleBuilding.buildingSaveEnergyInfo(data);
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

    async buildingSaveIndoorInfo(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.project.singleBuilding.buildingSaveIndoorInfo(data);
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

    async buildingSaveIndoorParameterInfo(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.project.singleBuilding.buildingSaveIndoorParameterInfo(data);
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

    async buildingSaveWaterInfo(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.project.singleBuilding.buildingSaveWaterInfo(data);
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

    async buildingPointImage(){
        const { ctx, config } = this;
        const path = config.baseDir + "/app/public/file/point";
        const files = fs.readdirSync(path);
        ctx.body = {
            code: 200,
            image: '/public/file/point/' + files[Math.floor(Math.random() * files.length)]
        };
    }

    async buildingPointAdd(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.project.singleBuilding.buildingPointAdd(data);
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

    async buildingPointDel(){
        const { ctx } = this;
        const buildingPointId = ctx.request.body.buildingPointID;
        const result = await ctx.service.project.singleBuilding.buildingPointDel(buildingPointId);
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

    async buildingPointDeviceRelevant(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.singleBuilding.buildingPointDeviceRelevant(projectId);
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

    async buildingPointSurveyRelevant(){
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const projectId = ctx.request.body.projectID;
        const result = await ctx.service.project.singleBuilding.buildingPointSurveyRelevant(userId, projectId);
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

    async buildingPointDeviceDetail(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceId;
        var sTime = ctx.request.body.startTime;
        var eTime = ctx.request.body.endTime;
        const result = await ctx.service.project.singleBuilding.buildingPointDeviceDetail(deviceId, sTime, eTime);
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

    async buildingPointSurveyDetail(){
        const { ctx } = this;
        const surveyId = ctx.request.body.surveyID;
        const startTime = ctx.request.body.beginTime;
        const endTime = ctx.request.body.endTime;
        const relation = ctx.request.body.relation;
        const projectId = ctx.request.body.objectID;
        const result = await ctx.service.project.singleBuilding.buildingPointSurveyDetail(surveyId, startTime, endTime, relation, projectId);
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

    async buildingPointUpdate(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.project.singleBuilding.buildingPointUpdate(data);
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

    async buildingPointInfo(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.project.singleBuilding.buildingPointInfo(buildingId);
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

    async buildingSurveyAdd(){
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.project.singleBuilding.buildingSurveyAdd(userId, buildingId);
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

    async buildingSurveyBind(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingID;
        const surveyId = ctx.request.body.surveyID;
        const result = await ctx.service.project.singleBuilding.buildingSurveyBind(buildingId, surveyId);
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

    async buildingEnergyUpdate(){
        const { ctx } = this;
        const data = ctx.request.body;
        const result = await ctx.service.project.singleBuilding.buildingEnergyUpdate(data);
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

    async topBuildingInfo(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingId;
        const result = await ctx.service.project.singleBuilding.topBuildingInfo(buildingId);
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

    async topBuildingRoomInfo(){
        const { ctx } = this;
        const buildingId = ctx.request.body.buildingId;
        const result = await ctx.service.project.singleBuilding.topBuildingRoomInfo(buildingId);
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
}

module.exports = SingleBuildingController;