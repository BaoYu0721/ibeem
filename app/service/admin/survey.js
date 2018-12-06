'use strict';

const Service = require('egg').Service;

class SurveyService extends Service {
    async surveyList(){
        var survey = null;
        try {
            survey = await this.app.mysql.select('survey');
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in survey){
            var answerCount = null;
            try {
                answerCount = await this.app.mysql.query('select count(id) from answer where survey_id = ?', [survey[key].id]);
            } catch (error) {
                return -1;
            }
            const resultMap = {
                id: survey[key].id,
                title: survey[key].title == null? '': survey[key].title,
                introduction: survey[key].introduction == null? '': survey[key].introduction,
                name: survey[key].name == null? '': survey[key].name,
                count: answerCount[0]['count(id)'],
                state: survey[key].state,
                isFinished: survey[key].is_finished
            }
            resultList.push(resultMap);
        }
        return resultList;
    }
}

module.exports = SurveyService;