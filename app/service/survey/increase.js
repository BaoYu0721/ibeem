'use strict';

const Service = require('egg').Service;

class IncreaseService extends Service {

    async commit(userId, survey) {
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:survey:add";
        var ttl = 1000;

        return redlock.lock(resource, ttl).then(function(lock) {
            async function transation() {
                const conn = await app.mysql.beginTransaction();
                try {
                    const surveyResult = await conn.insert('survey', {creator_id: userId, html: survey.html, introduction: survey.introduction, 
                        title: survey.title, is_finished: survey.isFinished, type: survey.pagingType, number: survey.pagingNum, state: 0, created_on: new Date()});
                    if(surveyResult.insertId == 0) throw -1;
                    var paragraph = survey.dl;
                    for(var i in paragraph){
                        const paragraphResult = await conn.insert('paragraph', {created_on: new Date(), introduction: paragraph[i].title, sequence: paragraph[i].order,
                            survey_id: surveyResult.insertId});
                        if(paragraphResult.insertId == 0) throw -1;
                        var question = paragraph[i].questionList;
                        for(var j in question){
                            await conn.insert('question', {created_on: new Date(), required: question[j].required, sequence: question[j].sequence, setting: question[j].setting,
                                survey_id: surveyResult.insertId, title: question[j].title, type: question[j].type, paragraph_id: paragraphResult.insertId});
                        }
                    }
                    await conn.commit();
                } catch (error) {
                    conn.rollback();
                    lock.unlock();
                    return -1;
                }
                lock.unlock();
                return 0;
            }
            return transation();
        });
    }

    async questionSelect(questionId){
        var result = null;
        try {
            result = await this.app.mysql.get('question_bank', {id: questionId});
        } catch (error) {
            return -1;
        }
        const question = {
            id: result.id,
            type: result.type,
            setting: result.setting,
            title: result.title,
            htlm: result.html
        };
        return question;
    }
}

module.exports = IncreaseService;