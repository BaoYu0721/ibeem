'use strict';

const Service = require('egg').Service;

class IndexService extends Service {
    async questionList() {
        var question = null;
        try {
            question = await this.app.mysql.select('question_bank');
        } catch (error) {
            return -1;
        }
        const questionList = [];
        for(var key in question){
            const questionMap = {
            id: question[key].id,
            type: question[key].type,
            setting: question[key].setting,
            title: question[key].name 
            };
            questionList.push(questionMap);
        }
        return questionList;
    }
    
    async surveyList(userId) {
        var survey = null;
        var user = null;
        try {
            survey = await this.app.mysql.select('survey', {where: {creator_id: userId}});
            user = await this.app.mysql.get('user', { id: userId });
        } catch (error) {
            return -1;
        }
        const surveyList = [];
        for(var key in survey){
            var answerCount = null;
            try {
                answerCount = await this.app.mysql.query('select count(id) from answer where survey_id = ?', [survey[key].id]);
            } catch (error) {
                return -1;
            }
            const surveyMap = {
              id: survey[key].id,
              title: survey[key].title,
              introduction: survey[key].introduction,
              name: user.name,
              isFinished: survey[key].is_finished,
              count: answerCount[0]['count(id)']
            };
            surveyList.push(surveyMap);
        }
        return surveyList;
    }
}

module.exports = IndexService;