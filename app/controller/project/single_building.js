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
            if(sheet1.length <= 1){
                return ctx.body = {
                    code: 1000
                };
            }
            for(var i = 1; i < sheet1.length; ++i){
                if(!sheet1[i][4]){
                    return ctx.body = {
                        code: 1003
                    };
                }
            }
            const result = await ctx.service.project.singleBuilding.buildingImportType1(projectId, xlsx);
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
            const result = await ctx.service.project.singleBuilding.buildingImportType2(projectId, xlsx);
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
            const result = await ctx.service.project.singleBuilding.buildingImportType3(projectId, xlsx, buildingName);
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
        var   image = '';
        if(files.length){
            image = '/public/file/point/' + files[Math.floor(Math.random() * files.length)];
        }
        ctx.body = {
            code: 200,
            image: image
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
        const surveyID = ctx.request.body.surveyID;
        const beginTime = ctx.request.body.beginTime;
        const endTime = ctx.request.body.endTime;
        const relation = ctx.request.body.relation;
        const objectID = ctx.request.body.objectID;
        const result = await ctx.service.survey.statistics.surveyStatistics(surveyID, objectID, relation, beginTime, endTime);
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

    async topBuildingUpdate(){
        const { ctx } = this;
        const result = await ctx.service.project.singleBuilding.topBuildingUpdate(ctx.request.body);
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

    async topBuildingExport(){
        const { ctx } = this;
        const buildingId = ctx.query.topBuildingID;
        const result = await ctx.service.project.singleBuilding.topBuildingInfo(buildingId);
        if(result == -1){
            return ctx.body = {
                messg: "系统繁忙，请重试",
                code: 1005
            };
        }
        const filename = new Date().getTime().toString() + '.xlsx';
        ctx.set("Content-Disposition", "attachment;filename=" + filename);
        const sheet = [];

        const sheet_title_1 = ["机构名称", "地址1", "地址2", "地址3", "地址4", "城市", "邮编", "国家", "部门类型", "地址号码"];
        const sheet_data_1 = [];
        sheet_data_1[0] = result["organisationName"];
        sheet_data_1[1] = result["organisationAddressline1"];
        sheet_data_1[2] = result["organisationAddressline2"];
        sheet_data_1[3] = result["organisationAddressline3"];
        sheet_data_1[4] = result["organisationAddressline4"];
        sheet_data_1[5] = result["organisationCity"];
        sheet_data_1[6] = result["organisationPostcode"];
        sheet_data_1[7] = result["organisationCountry"];
        sheet_data_1[8] = result["sectorType"];
        sheet_data_1[9] = result["siteNumber"];
        const sheet_map_1 = [];
        sheet_map_1.push(sheet_title_1);
        sheet_map_1.push(sheet_data_1);
        const sheet1 = {
            name: "sheet1",
            data: sheet_map_1
        };
        sheet.push(sheet1);

        const sheet_title_2 = ["地址1", "地址2", "地址3", "地址4", "城市", "邮编", "国家", "建筑数量", "城市文脉", "游泳池", "游池类型"];
        const sheet_data_2 = [];
        sheet_data_2[0] = result["siteAddressline1"];
        sheet_data_2[1] = result["siteAddressline2"];
        sheet_data_2[2] = result["siteAddressline3"];
        sheet_data_2[3] = result["siteAddressline4"];
        sheet_data_2[4] = result["siteCity"];
        sheet_data_2[5] = result["sitePostcode"];
        sheet_data_2[6] = result["siteCountry"];
        sheet_data_2[7] = result["numberOfBuildings"];
        sheet_data_2[8] = result["urbanContext"];
        sheet_data_2[9] = result["swimmingPool"];
        sheet_data_2[10] = result["poolType"];
        const sheet_map_2 = [];
        sheet_map_2.push(sheet_title_2);
        sheet_map_2.push(sheet_data_2);
        const sheet2 = {
            name: "sheet2",
            data: sheet_map_2
        };
        sheet.push(sheet2);

        //const sheet_title_3 = ["主要活动类型", "租赁型", "建筑图纸的可用性", "施工阶段", "施工日期", "翻新日期", "翻新的细节", "结构类型", "总内部区域", "建筑占地面积", "平均高度", "层", "周长", "外部周边长度", "透气性", "玻璃外墙的百分比", "大门外墙的百分比", "楼层类型", "原发性通气策略", "一次加热型", "主要的取暖燃料", "主供暖系统效率", "照明容量", "照明控制方式", "冷水机组", "冷却型", "每年的入住时间", "居住人数", "活动类型1", "活动类型1楼面积", "活动类型2", "活动类型2楼面积", "服务器机房", "可持续性认证类型", "可持续性认证评级", "餐饮厨房", "用餐次数", "电梯数量", "升降式", "冷水机组容量", "辅助计量", "删除"];
        ctx.body = ctx.helper.xlsxData(sheet);
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

    async topBuildingRoomAdd(){
        const { ctx } = this;
        const buildingId = ctx.request.body.topBuildingID;
        const roomType = ctx.request.body.roomType;
        const floorLocation = ctx.request.body.floorLocation;
        const grossInternalArea = ctx.request.body.grossInternalArea;
        const result = await ctx.service.project.singleBuilding.topBuildingRoomAdd(buildingId, roomType, floorLocation, grossInternalArea);
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

    async topBuildingRoomEdit(){
        const { ctx } = this;
        const roomId = ctx.request.body.topRoomID;
        const roomType = ctx.request.body.roomType;
        const floorLocation = ctx.request.body.floorLocation;
        const grossInternalArea = ctx.request.body.grossInternalArea;
        const result = await ctx.service.project.singleBuilding.topBuildingRoomEdit(roomId, roomType, floorLocation, grossInternalArea);
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

    async topBuildingRoomDel(){
        const { ctx } = this;
        const roomId = ctx.request.body.topRoomID;
        const result = await ctx.service.project.singleBuilding.topBuildingRoomDel(roomId);
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

module.exports = SingleBuildingController;