'use strict';

const Service = require('egg').Service;

class IndexService extends Service {
    async surveyDetails(surveyID) {
        var survey = null;
        var result = {};
        try {
            survey = await this.app.mysql.select('survey', {where: {id: surveyID}});
            if (survey.length == 0) {
                // no proper survey
                result['createTime'] = '';
                result['introduction'] = '请输入正确的surveyID';
                result['pagingNum'] = 0;
                result['pagingType'] = 1;
                result['surveyID'] = surveyID;
                result['title'] = '请输入正确的surveyID';
                result['code'] = -1;
                result['list'] = [];
            }
            else {
                result['createTime'] = survey[0].created_on;
                result['introduction'] = survey[0].introduction;
                result['pagingNum'] = survey[0].number;
                result['pagingType'] = survey[0].type;
                result['surveyID'] = survey[0].id;
                result['title'] = survey[0].title;

                var paragraph_list = [];
                var res_paragraph_list = [];

                paragraph_list = await this.app.mysql.select('paragraph', {where: {survey_id: surveyID}});
                // console.log(JSON.stringify(paragraph_list));
                if (paragraph_list.length == 0) {
                    var paragraph_map = {};
                    var question_list = [];
                    var res_question_list = [];
                    paragraph_map['title'] = '';
                    paragraph_map['order'] = 1;
                    question_list = await this.app.mysql.select('question', {where: {survey_id: surveyID}});
                    var ques_len = question_list.length;
                    for (var i = 0; i < ques_len; i++) {
                        var tmp_ques_map = {};
                        tmp_ques_map['questionID'] = question_list[i].id;
                        tmp_ques_map['required'] = question_list[i].required;
                        tmp_ques_map['sequence'] = question_list[i].sequence;
                        tmp_ques_map['setting'] = question_list[i].setting;
                        tmp_ques_map['title'] = question_list[i].title;
                        tmp_ques_map['type'] = question_list[i].type;
                        res_question_list.push(tmp_ques_map);
                    }
                    paragraph_map['questionList'] = res_question_list;
                    res_paragraph_list.push(paragraph_map);
                }
                else {
                    var para_len = paragraph_list.length;
                    for (var i = 0; i < para_len; i++) {
                        var paragraph_map = {};
                        var question_list = [];
                        var res_question_list = [];
                        paragraph_map['title'] = paragraph_list[i].introduction;
                        paragraph_map['order'] = paragraph_list[i].sequence;
                        question_list = await this.app.mysql.select('question', {where: {survey_id: surveyID, paragraph_id: paragraph_list[i].id}});
                        var ques_len = question_list.length;
                        for (var j = 0; j < ques_len; j++) {
                            var tmp_ques_map = {};
                            tmp_ques_map['questionID'] = question_list[j].id;
                            tmp_ques_map['required'] = question_list[j].required;
                            tmp_ques_map['sequence'] = question_list[j].sequence;
                            tmp_ques_map['setting'] = question_list[j].setting;
                            tmp_ques_map['title'] = question_list[j].title;
                            tmp_ques_map['type'] = question_list[j].type;
                            res_question_list.push(tmp_ques_map);
                        }
                        paragraph_map['questionList'] = res_question_list;
                        res_paragraph_list.push(paragraph_map);
                    }
                }
                result['list'] = res_paragraph_list;
                result['code'] = 200;
            }
            return result;
        } 
        catch (error) {
            console.log('[service.survey.mobile.surveyDetails]:select from database error!' + error);
            result['createTime'] = '';
            result['introduction'] = '请输入正确的surveyID';
            result['pagingNum'] = 0;
            result['pagingType'] = 1;
            result['surveyID'] = surveyID;
            result['title'] = '请输入正确的surveyID';
            result['code'] = -2;
            result['list'] = [];
            return result;
        }
    }

    async answerSurvey(answer, ip) {
        // test ip: '123.112.102.239'
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();

        const map_result = await this.service.utils.http.tencentMapGet('123.112.102.239');
        var longitude = null;
        var latitude = null;
        var province = null;
        if (map_result.status != 0) {
            longitude = 0;
            latitude = 0;
            province = '';
        }
        else {
            longitude = map_result.result.location.lng;
            latitude = map_result.result.location.lat;
            province = map_result.result.ad_info.province;
        }
        // console.log(answer);
        try {
            const json_obj = JSON.parse(answer);
            var survey_relation_list = [];
            const relation = json_obj.relation;
            if (relation == 1) {
                // 项目问卷
                survey_relation_list = await app.mysql.select('survey_relation', {where: {
                    survey_id: json_obj.surveyID, relation: 1, project_id: json_obj.objectID}});
            }
            else if (relation == 2) {
                // 建筑问卷
                survey_relation_list = await app.mysql.select('survey_relation', {where: {
                    survey_id: json_obj.surveyID, relation: 2, building_id: json_obj.objectID}});
            }
            else if (relation == 3) {
                // 测点问卷
                survey_relation_list = await app.mysql.select('survey_relation', {where: {
                    survey_id: json_obj.surveyID, relation: 3, building_point_id: json_obj.objectID}});
            }
            else {
                // 啥都没绑定的问卷
                survey_relation_list = [];
            }
            var survey_relation_id = null;
            if (survey_relation_list.length > 0) {
                survey_relation_id = survey_relation_list[0].id;
            }
            var survey = await app.mysql.select('survey', {where: {id: json_obj.surveyID}});
            if (survey.length == 0) {
                // no such surveyID
                return -2;
            }
            const survey_id = survey[0].id;

            // 以上为数据准备过程
            const conn = await app.mysql.beginTransaction();
            var ttl = 1000;
            var resource1 = "ibeem_test:answer";
            var res1 = await redlock.lock(resource1, ttl).then(function(lock) {
                async function transation() {
                    try {
                        var tmp_result = await conn.insert('answer', {latitude: latitude, longitude: longitude, survey_relation_id: survey_relation_id,
                            created_on: new Date(), ip: ip, province: province, survey_id: survey_id, updated_on: new Date()});
                        lock.unlock().catch(function(err) {
                            console.log(err);
                        });
                        return tmp_result.insertId;
                    }
                    catch (error) {
                        console.log('[service.survey.mobile.answerSurvey.lockcallback]: error!!---' + error);
                        lock.unlock().catch(function(err) {
                            console.log(err);
                        });
                        return -1;
                    }
                }
                return transation();
            });
            if (res1 == -1) {
                conn.rollback();
                return -3;
            }

            var resource2 = "ibeem_test:answer_detail";
            var res2 = await redlock.lock(resource2, ttl).then(function(lock) {
                async function transation() {
                    try {
                        for (var i = 0; i < json_obj.list.length; i++) {
                            await conn.insert('answer_detail', {question_id: json_obj.list[i].questionID, answer_id: res1, created_on: new Date(), 
                                reply_content: JSON.stringify(json_obj.list[i].replyContent), isanswered: json_obj.list[i].isanswered, updated_on: new Date()});
                        }
                        lock.unlock().catch(function(err) {
                            console.log(err);
                        });
                        return 0;
                    }
                    catch (error) {
                        console.log('[service.survey.mobile.answerSurvey.lockcallback]: error!!---' + error);
                        lock.unlock().catch(function(err) {
                            console.log(err);
                        });
                        return -1;
                    }
                }
                return transation();
            });
            if (res2 == -1) {
                conn.rollback();
                return -3;
            }

            await conn.commit();
            // success
            return 0;
        }
        catch (error) {
            console.log('[service.survey.mobile.answerSurvey]: unexpected error! ' + error);
            return -1;
        }
    }
}

module.exports = IndexService;