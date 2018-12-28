'use strict';

const Service = require('egg').Service;

class AnswerService extends Service {
    async answerDetailGetListByQuestion(question_id, survey_id, object_id, relation, beginTime, endTime) {
        try {
            var sql = '';
            var para_list = [];
            if (relation == 1) {
                sql = 'select * from answer_detail where question_id=? and answer_id in (\
                    select id from answer where survey_id=? and survey_relation_id in (\
                        select id from survey_relation where survey_id=? and project_id=?))';
                para_list.push(question_id);
                para_list.push(survey_id);
                para_list.push(survey_id);
                para_list.push(object_id);
            }
            else if (relation == 2) {
                sql = 'select * from answer_detail where question_id=? and answer_id in (\
                    select id from answer where survey_id=? and survey_relation_id in (\
                        select id from survey_relation where survey_id=? and building_id=?))';
                para_list.push(question_id);
                para_list.push(survey_id);
                para_list.push(survey_id);
                para_list.push(object_id);
            }
            else if (relation == 3) {
                sql = 'select * from answer_detail where question_id=? and answer_id in (\
                    select id from answer where survey_id=? and survey_relation_id in (\
                        select id from survey_relation where survey_id=? and building_point_id=?))';
                para_list.push(question_id);
                para_list.push(survey_id);
                para_list.push(survey_id);
                para_list.push(object_id);
            }
            else {
                // relation == 0
                sql = 'select * from answer_detail where question_id=?';
                para_list.push(question_id);
            }
            if (beginTime != null && endTime != null && beginTime != '' && endTime != '') {
                sql = sql + ' and created_on >STR_TO_DATE(?,\'%Y-%m-%d %H:%i:%s\') and created_on< STR_TO_DATE(?,\'%Y-%m-%d %H:%i:%s\')';
                para_list.push(beginTime);
                para_list.push(endTime);
            }
            const result = await this.app.mysql.query(sql, para_list);
            return result;
        }
        catch (error) {
            console.log('service.survey.answer.answerDetailGetListByQuestion error! --- ' + error);
            return -1;
        }
    }
}

module.exports = AnswerService;