'use strict';

const Service = require('egg').Service;

class SurveyService extends Service {
    async releaseSurvey() {
        const { app } = this;
        var survey;
        try {
            survey = await app.mysql.select('survey', {where: {state: 1}});
        } catch (error) {
            return -1;
        }
        const survey_list = [];
        for(var key in survey){
            const survey_map = {
                id:           survey[key].id,
                title:        survey[key].title,
                introduction: survey[key].introduction
            };
            survey_list.push(survey_map);
        }
        return survey_list;
    }
}

module.exports = SurveyService;
