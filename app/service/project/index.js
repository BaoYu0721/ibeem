'use strict';

const Service = require('egg').Service;

class IndexService extends Service {
    async projectList(userId){
        var project = null;
        try {
            project = await this.app.mysql.select('project', {where: {creator_id: userId}});
        } catch (error) {
            return -1;
        }
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
