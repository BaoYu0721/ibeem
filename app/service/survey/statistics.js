'use strict';

const Service = require('egg').Service;

class StatisticsService extends Service {
    async surveyStatistics(surveyId, startTime, endTime, relation, projectId){
        return -1;
    }
}

module.exports = StatisticsService;