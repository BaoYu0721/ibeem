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

    async answerDetailGetListByQuestionAndRelation(question_id, survey_id, beginTime, endTime, relation, object_id) {
        try {
            var sql = 'select * from answer_detail where question_id=?';
            var para_list = [];
            para_list.push(question_id);
            if (beginTime != null && endTime != null && beginTime != '' && endTime != '') {
                sql = sql + ' and created_on >STR_TO_DATE(?,\'%Y-%m-%d %H:%i:%s\') and created_on< STR_TO_DATE(?,\'%Y-%m-%d %H:%i:%s\')';
                para_list.push(beginTime);
                para_list.push(endTime);
            }
            if (relation == 1) {
                sql = sql + ' and answer_id in (select id from answer where survey_id=? and survey_relation_id in (select id from survey_relation where survey_id=? and project_id=?))';
                para_list.push(survey_id);
                para_list.push(survey_id);
                para_list.push(object_id);
            }
            else if (relation == 2) {
                sql = sql + ' and answer_id in (select id from answer where survey_id=? and survey_relation_id in (select id from survey_relation where survey_id=? and building_id=?))';
                para_list.push(survey_id);
                para_list.push(survey_id);
                para_list.push(object_id);
            }
            else if (relation == 3) {
                sql = sql + ' and answer_id in (select id from answer where survey_id=? and survey_relation_id in (select id from survey_relation where survey_id=? and building_point_id=?))';
                para_list.push(survey_id);
                para_list.push(survey_id);
                para_list.push(object_id);
            }
            const result = await this.app.mysql.query(sql, para_list);
            return result;
        }
        catch (error) {
            console.log('service.survey.answer.answerDetailGetListByQuestionAndRelation error! --- ' + error);
            return -1;
        }
    }

    async answerDetailGetAnswerDetailByUserAndQuestion(answer_id, question_id) {
        try {
            var list = await this.app.mysql.query('select * from answer_detail where question_id=? and answer_id=?', [question_id, answer_id]);
            if (list != null && list.length != 0) {
                return list[0];
            }
            else {
                return -1;
            }
        }
        catch (error) {
            console.log('service.survey.answer.answerDetailGetAnswerDetailByUserAndQuestion error! --- ' + error);
            return -1;
        }
    }
}

module.exports = AnswerService;