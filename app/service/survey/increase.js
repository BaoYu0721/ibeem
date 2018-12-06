'use strict';

const Service = require('egg').Service;

class IncreaseService extends Service {

    async commit(userId, survey) {
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const conn = await app.mysql.beginTransaction();
        var ttl = 1000;
        try {
            var resource = "ibeem_test:survey";
            var res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        const result = await conn.insert('survey', {
                            creator_id: userId, 
                            html: survey.html, 
                            introduction: survey.introduction, 
                            title: survey.title, 
                            is_finished: survey.isFinished, 
                            type: survey.pagingType, 
                            number: survey.pagingNum, 
                            state: 0, created_on: new Date()
                        });
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return result;
                    } catch (error) {
                        console.log(error);
                        conn.rollback();
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return -1;
                    }
                }
                return transation();
            });
            if(res == -1) return res;
            resource = "ibeem_test:paragraph";
            const paragraphIdList = [];
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        var paragraph = survey.dl;
                        for(var i in paragraph){
                            const result = await conn.insert('paragraph', {
                                created_on: new Date(), 
                                introduction: paragraph[i].title, 
                                sequence: paragraph[i].order,
                                survey_id: res.insertId
                            });
                            paragraphIdList.push(result.insertId);
                        }
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return {
                            surveyId: res.insertId,
                            paragraphIds: paragraphIdList
                        };
                    } catch (error) {
                        console.log(error);
                        conn.rollback();
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return -1;
                    }
                }
                return transation();
            });
            if(res == -1) return res;
            resource = "ibeem_test:survey";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        var paragraph = survey.dl;
                        for(var i in paragraph){
                            var question = paragraph[i].questionList;
                            for(var j in question){
                                await conn.insert('question', {
                                    created_on: new Date(), 
                                    required: question[j].required, 
                                    sequence: question[j].sequence, 
                                    setting: question[j].setting,
                                    survey_id: res.surveyId, 
                                    title: question[j].title, 
                                    type: question[j].type, 
                                    paragraph_id: res.paragraphIds[i]
                                });
                            }
                        }
                    } catch (error) {
                        console.log(error);
                        conn.rollback();
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        return -1;
                    }
                    lock.unlock()
                    .catch(function(err) {
                        console.error(err);
                    });
                    return 0;
                }
                return transation();
            });
            if(res == -1) return res;
            await conn.commit();
            return res;
        } catch (error) {
            return -1;
        }
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