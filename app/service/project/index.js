'use strict';

const Service = require('egg').Service;

class IndexService extends Service {
    async projectList(userId){
        var project = null;
        console.log(userId)
        try {
            project = await this.app.mysql.query('select id, name, des, image from project where creator_id = ? or id in(select project_id from user_project where role = 1 and user_id = ?)', [userId, userId]);
        } catch (error) {
            return -1;
        }
        console.log(project)
        const projectList = [];
        for(var key in project){
            const projectMap = {
            id: project[key].id,
            name: project[key].name,
            decribe: project[key].des,
            image: project[key].image
            }
            projectList.push(projectMap);
        }
        return projectList;
    }

    async buildingExport(buildingId){
        var result = null;
        try {
            result = await this.app.mysql.get('building', {id: buildingId});
        } catch (error) {
            return -1;
        }
        if(!result){
            return null;
        }
        return result;
    }
}

module.exports = IndexService;
