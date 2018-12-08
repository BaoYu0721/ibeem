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
}

module.exports = IndexService;