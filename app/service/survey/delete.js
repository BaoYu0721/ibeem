'use strict';

const Service = require('egg').Service;

class DeleteService extends Service {
    async surveyDelete(surveyId) {
        const { app, service } = this;
        const redlock = service.utils.lock.lockInit();
        const resource = "ibeem_test:survey:" + surveyId;
        var ttl = 1000;

        return redlock.lock(resource, ttl).then(function(lock) {
            async function transation() {
                var res = null;
                try {
                    res = await app.mysql.get('survey', {id: surveyId});
                } catch (error) {
                    lock.unlock();
                    return -1;
                }
                if(res == null){
                    lock.unlock();
                    return null;
                }
                const conn = await app.mysql.beginTransaction();
                try {
                    await conn.query('delete from answer_detail where answer_id in(select id from answer where survey_id = ?)', [surveyId]);
                    await conn.delete('answer', {survey_id: surveyId});
                    await conn.delete('question', {survey_id: surveyId});
                    await conn.delete('paragraph', {survey_id: surveyId});
                    await conn.delete('building_point_survey', {survey_id: surveyId});
                    await conn.delete('building_survey', {survey_id: surveyId});
                    await conn.delete('project_survey', {survey_id: surveyId});
                    await conn.delete('survey_relation', {survey_id: surveyId});
                    await conn.delete('survey', {id: surveyId});
                    await conn.commit();
                } catch (error) {
                    await conn.rollback();
                    lock.unlock();
                    res = -1;
                }
                lock.unlock();
                return 0;
            }
            return transation();
        });
    }
}

module.exports = DeleteService;