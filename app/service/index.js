'use strict';

const Service = require('egg').Service;

class IndexService extends Service {
    async buildingList(userId) {
        var building = null;
        try {
            building = await this.app.mysql.query('select * from building where project_id in(select id from project where creator_id = ?) or project_id in(select project_id from user_project where role = 1 and user_id = ?)', [userId, userId]);
        } catch (error) {
            return -1;
        }
        const buildingList = []
        for(var key in building) {
            var surveyCount = null;
            var deviceCount = null;
            var project = null;
            try {
                surveyCount = await this.app.mysql.query('select count(id) from building_survey where building_id = ?', [building[key].id]);
                deviceCount = await this.app.mysql.query('select count(id) from building_point where building_id = ?', [building[key].id]);
                project = await this.app.mysql.get('project', {id: building[key].project_id});
            } catch (error) {
                return -1;
            }
            const buildingData = {
                id: building[key].id,
                name: building[key].name,
                lat: building[key].latitude,
                lon: building[key].longitude,
                city: building[key].city,
                climaticProvince: building[key].climatic_province,
                type: building[key].type,
                level: building[key].level,
                projectID: building[key].project_id,
                projectName: project.name,
                surveyCount: surveyCount[0]['count(id)'],
                deviceCount: deviceCount[0]['count(id)']
            }
            buildingList.push(buildingData);
        }
        return buildingList;
    }

    async singleBuilding(buildingId, projectId){
        var building, project;
        try {
            project = await this.app.mysql.query('select name from project where id = ?', [projectId]);
            building = await this.app.mysql.query('select name from building where id = ?', [buildingId]);
        } catch (error) {
            return -1;
        }
        const result = {
            projectName: project.length? project[0].name: null,
            buildingName: building.length? building[0].name: null
        };
        return result;
    }

    async deviceList(userId) {
        var device = null;
        try {
            device = await this.app.mysql.query('select * from device where owner_id = ? or id in(select device_id from device_attention where user_id = ?) or project_id in(select project_id from user_project where role = 1 and user_id = ?) or project_id in(select id from project where creator_id = ?)', [userId, userId, userId, userId]);
        } catch (error) {
            return -1;
        }
        const deviceList = [];
        for(var key in device){
            const deviceMap = {
            id: device[key].id,
            deviceName: device[key].name,
            latitude: device[key].latitude,
            longitude: device[key].longitude,
            address: device[key].address,
            status: device[key].Online_status,
            province: device[key].province
            }
            deviceList.push(deviceMap);
        }
        return deviceList;
    }

    async surveyList(userId){
        var answer = null;
        try {
            answer = await this.app.mysql.query('select * from answer where survey_id in (select id from survey where creator_id = ?) and longitude!=0 and latitude!=0', [userId]);
        } catch (error) {
            return -1;
        }
        const answerList = [];
        for(var key in answer){
            var survey = null;
            try {
                survey = await this.app.mysql.get('survey', {id: answer[key].survey_id});  
            } catch (error) {
                return -1;
            }
            const answerMap = {
                id: answer[key].id,
                lat: answer[key].latitude,
                lon: answer[key].longitude,
                name: survey.title,
                introduction: survey.introduction,
                province: answer[key].province,
                time: answer[key].created_on
            }
            answerList.push(answerMap);
        }
        return answerList;
    }
}

module.exports = IndexService;