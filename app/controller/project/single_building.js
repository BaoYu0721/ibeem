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
}

module.exports = SingleBuildingController;