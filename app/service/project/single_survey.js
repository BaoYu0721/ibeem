'use strict';

const Service = require('egg').Service;

class SingleSurveyService extends Service {
    async surveySearch(userId, projectId){
        var survey = null;
        try {
            const project = await this.app.mysql.get('project', {id: projectId});
            if(project){
                survey = await this.app.mysql.query('select id, title from survey where (creator_id = ? or creator_id = ?) and id not in(select survey_id from project_survey where project_id = ?)', [userId, project.creator_id, project.id]);
            }else{
                return -1;
            }
        } catch (error) {
            return -1;
        }
        return survey;
    }

    async surveyBind(projectId, surveyId){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const conn = await app.mysql.beginTransaction();
        var ttl = 1000;
        try {
            var resource = "ibeem_test:project_survey";
            var res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.insert('project_survey', {
                            created_on: new Date(),
                            project_id: projectId,
                            survey_id: surveyId
                        });
                    } catch (error) {
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
            resource = "ibeem_test:survey_relation";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.insert('survey_relation', {
                            created_on: new Date(),
                            project_id: projectId,
                            survey_id: surveyId,
                            relation: 1
                        });
                    } catch (error) {
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
}

module.exports = SingleSurveyService;