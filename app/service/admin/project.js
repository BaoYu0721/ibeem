'use strict';

const Service = require('egg').Service;

class ProjectService extends Service {
    async projectList(){
        var project = null;
        try {
            project = await this.app.mysql.select('project');
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in project){
            const resultMap = {
                id: project[key].id,
                name: project[key].name,
                decribe: project[key].des,
                image: project[key].image
            }
            resultList.push(resultMap);
        }
        return resultList;
    }
}

module.exports = ProjectService;