'use strict';

const Controller = require('egg').Controller;

class SingleBuildingController extends Controller {
    async buildingIncrease(){
        const { ctx } = this;
        const projectId = ctx.request.body.projectID;
        const buildingName = ctx.request.body.name;
        const buildingType = ctx.request.body.buildingType;
        console.log(projectId + ' ' + buildingName + ' ' + buildingType);
        if(buildingType == '1'){
            console.log(ctx.request.body);
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
        const buildingId = ctx.request.body.buildingID;
        const result = await ctx.service.project.singleBuilding.buildingPointData(buildingId);
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
}

module.exports = SingleBuildingController;