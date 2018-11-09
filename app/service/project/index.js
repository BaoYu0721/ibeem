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
}

module.exports = IndexService;
