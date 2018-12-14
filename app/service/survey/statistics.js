'use strict';

const Service = require('egg').Service;

class StatisticsService extends Service {
    async surveyStatistics(surveyID, objectID, relation, beginTime, endTime) {
        try {
            const survey_list = await this.app.mysql.select('survey', {where: {id: surveyID}});
            var final_array_list = [];
            var final_map = {};
            if (survey_list.length == 0) {
                // no such survey
                return -2;
            }
            
            // int peopleCount = answerDao.getAnswerCountBySurvey(surveyID,objectID,relation,beginTime,endTime);
            var sql = '';
            var para_list = [];
            if (relation == 3) {
                sql = 'select count(*) from answer where survey_id=? and survey_relation_id in (select id from survey_relation where survey_id=? and building_point_id=?)';
                para_list.push(surveyID);
                para_list.push(surveyID);
                para_list.push(objectID);
            }
            else if (relation == 1) {
                sql = 'select count(*) from answer where survey_id=? and survey_relation_id in (select id from survey_relation where survey_id=? and project_id=?)';
                para_list.push(surveyID);
                para_list.push(surveyID);
                para_list.push(objectID);
            }
            else if (relation == 2) {
                sql = 'select count(*) from answer where survey_id=? and survey_relation_id in (select id from survey_relation where survey_id=? and building_id=?)';
                para_list.push(surveyID);
                para_list.push(surveyID);
                para_list.push(objectID);
            }
            else {
                // relation == 0
                sql = 'select count(*) from answer where survey_id=?';
                para_list.push(surveyID);
            }
            console.log(beginTime, endTime);
            if (beginTime != null && endTime != null && beginTime != '' && endTime != '') {
                sql = sql + ' and created_on >STR_TO_DATE(?,\'%Y-%m-%d %H:%i:%s\') and created_on< STR_TO_DATE(?,\'%Y-%m-%d %H:%i:%s\')';
                para_list.push(beginTime);
                para_list.push(endTime);
            }
            const tmp_people_count = await this.app.mysql.query(sql, para_list);
            const people_count = tmp_people_count[0]['count(*)'];
            // console.log('=================' + people_count);

            // List<Paragraph> paragraphList = paragraphDao.getListBySurvey(surveyID);
            const paragraph_list = await this.app.mysql.query('select * from paragraph where survey_id=? order by sequence', [surveyID]);

            if (paragraph_list == null || paragraph_list.length == 0) {
                return -1;
            }
            else {
                for (var i = 0; i < paragraph_list.length; i++) {
                    console.log('============paragraph index:' + i);
                    var paragraph_map = {};
                    var result_question_list = [];
                    paragraph_map['title'] = paragraph_list[i].introduction;
                    paragraph_map['order'] = paragraph_list[i].sequence;
                    var question_list = await this.app.mysql.query('select * from question where survey_id=? and paragraph_id=? order by sequence', [surveyID, paragraph_list[i].id]);
                    if (question_list != null && question_list.length != 0) {
                        for (var j = 0; j < question_list.length; j++) {
                            console.log('    ============question index:' + j);
                            var item_list = [];   // 用于记录每个题各项综合结果参数的列表
                            var question_map = {};  // 存储整体结果
                            var m = {};    // 用于统计各项数量的map
                            var setting_map = {};  // 主要封装 item_list
                            question_map['title'] = question_list[j].title;
                            question_map['type'] = question_list[j].type;
                            question_map['sequence'] = question_list[j].sequence;
                            question_map['required'] = question_list[j].required;
                            const ques_setting_obj = JSON.parse(question_list[j].setting);

                            // List<AnswerDetail> answerDetailList = answerDetailDao.getListByQuestion(question.getId(),surveyID,objectID,relation,beginTime,endTime);
                            sql = '';
                            para_list = [];
                            if (relation == 1) {
                                sql = 'select * from answer_detail where question_id=? and answer_id in (\
                                    select id from answer where survey_id=? and survey_relation_id in (\
                                        select id from survey_relation where survey_id=? and project_id=?))';
                                para_list.push(question_list[j].id);
                                para_list.push(surveyID);
                                para_list.push(surveyID);
                                para_list.push(objectID);
                            }
                            else if (relation == 2) {
                                sql = 'select * from answer_detail where question_id=? and answer_id in (\
                                    select id from answer where survey_id=? and survey_relation_id in (\
                                        select id from survey_relation where survey_id=? and building_id=?))';
                                para_list.push(question_list[j].id);
                                para_list.push(surveyID);
                                para_list.push(surveyID);
                                para_list.push(objectID);
                            }
                            else if (relation == 3) {
                                sql = 'select * from answer_detail where question_id=? and answer_id in (\
                                    select id from answer where survey_id=? and survey_relation_id in (\
                                        select id from survey_relation where survey_id=? and building_point_id=?))';
                                para_list.push(question_list[j].id);
                                para_list.push(surveyID);
                                para_list.push(surveyID);
                                para_list.push(objectID);
                            }
                            else {
                                // relation == 0
                                sql = 'select * from answer_detail where question_id=?';
                                para_list.push(question_list[j].id);
                            }
                            if (beginTime != null && endTime != null && beginTime != '' && endTime != '') {
                                sql = sql + ' and created_on >STR_TO_DATE(?,\'%Y-%m-%d %H:%i:%s\') and created_on< STR_TO_DATE(?,\'%Y-%m-%d %H:%i:%s\')';
                                para_list.push(beginTime);
                                para_list.push(endTime);
                            }
                            const answer_detail_list = await this.app.mysql.query(sql, para_list);

                            if (question_list[j].type != 0) {
                                // 不是填空题
                                
                                var pcount = 0;
                                for (var k = 0; k < answer_detail_list.length; k++) {
                                    if (answer_detail_list[k].isanswered == 1) {
                                        pcount++;
                                    }
                                }

                                // 单选题
                                if (question_list[j].type == 1) {
                                    console.log('        单选');
                                    for (var k = 0; k < ques_setting_obj.items.length; k++) {
                                        var tmp_id = ques_setting_obj.items[k].id;
                                        for (var l = 0; l < answer_detail_list.length; l++) {
                                            if (answer_detail_list[l].isanswered == 1) {
                                                const answer_content_obj = JSON.parse(answer_detail_list[l].reply_content);
                                                if (tmp_id == answer_content_obj.id) {
                                                    if (m[tmp_id.toString()] == undefined) {
                                                        m[tmp_id.toString()] = 1;
                                                    }
                                                    else {
                                                        m[tmp_id.toString()] = m[tmp_id.toString()] + 1;
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    for (var k = 0; k < ques_setting_obj.items.length; k++) {
                                        var item_map = {};
                                        item_map['id'] = ques_setting_obj.items[k].id;
                                        item_map['text'] = ques_setting_obj.items[k].text;
                                        item_map['has_img'] = ques_setting_obj.items[k].has_img;
                                        item_map['img_url'] = ques_setting_obj.items[k].img_url;
                                        item_map['can_input'] = ques_setting_obj.items[k].can_input;
                                        item_map['input_content'] = ques_setting_obj.items[k].input_content;
                                        if (m[ques_setting_obj.items[k].id.toString()] == undefined) {
                                            item_map['count'] = 0;
                                        }
                                        else {
                                            item_map['count'] = m[ques_setting_obj.items[k].id.toString()];
                                        }
                                        item_list.push(item_map);
                                    }
                                    setting_map['items'] = item_list;
                                    question_map['setting'] = setting_map;
                                    question_map['peoplecount'] = pcount;
                                }

                                else if (question_list[j].type == 2) {
                                    // 多选题
                                    console.log('        多选');
                                    for (var k = 0; k < ques_setting_obj.items.length; k++) {
                                        var tmp_id = ques_setting_obj.items[k].id;
                                        for (var l = 0; l < answer_detail_list.length; l++) {
                                            if (answer_detail_list[l].isanswered == 1) {
                                                const answer_content_obj = JSON.parse(answer_detail_list[l].reply_content);
                                                const answers = answer_content_obj.answers;
                                                for (var n = 0; n < answers.length; n++) {
                                                    if (tmp_id == answers[n].id) {
                                                        if (m[tmp_id.toString()] == undefined) {
                                                            m[tmp_id.toString()] = 1;
                                                        }
                                                        else {
                                                            m[tmp_id.toString()] = m[tmp_id.toString()] + 1;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    console.log('        多选flag1');

                                    for (var k = 0; k < ques_setting_obj.items.length; k++) {
                                        var item_map = {};
                                        item_map['id'] = ques_setting_obj.items[k].id;
                                        item_map['text'] = ques_setting_obj.items[k].text;
                                        item_map['has_img'] = ques_setting_obj.items[k].has_img;
                                        item_map['img_url'] = ques_setting_obj.items[k].img_url;
                                        item_map['can_input'] = ques_setting_obj.items[k].can_input;
                                        item_map['input_content'] = ques_setting_obj.items[k].input_content;
                                        if (m[ques_setting_obj.items[k].id.toString()] == undefined) {
                                            item_map['count'] = 0;
                                        }
                                        else {
                                            item_map['count'] = m[ques_setting_obj.items[k].id.toString()];
                                        }
                                        item_list.push(item_map);
                                    }
                                    setting_map['items'] = item_list;
                                    setting_map['min_input'] = ques_setting_obj.min_input;
                                    setting_map['max_input'] = ques_setting_obj.max_input;
                                    question_map['setting'] = setting_map;
                                    question_map['peoplecount'] = pcount;
                                    console.log('        多选flag2');
                                }

                                else if (question_list[j].type == 3) {
                                    // 量表题
                                    console.log('        量表');
                                    var yarray = ques_setting_obj.y_axis;
                                    var xarray = ques_setting_obj.x_axis;
                                    for (var k = 0; k < yarray.length; k++) {
                                        var tmp_id = yarray[k].id;
                                        for (var n = 0; n < xarray.length; n++) {
                                            var val = xarray[n].val;
                                            for (var a = 0; a < answer_detail_list.length; a++) {
                                                if (answer_detail_list[a].isanswered == 1) {
                                                    const answer_content_obj = JSON.parse(answer_detail_list[a].reply_content);
                                                    const answers = answer_content_obj.answers;
                                                    for (var b = 0; b < answers.length; b++) {
                                                        if (tmp_id == answers[b].id && val == answers[b].val) {
                                                            if (m[tmp_id.toString() + val.toString()] == undefined) {
                                                                m[tmp_id.toString() + val.toString()] = 1;
                                                            }
                                                            else {
                                                                m[tmp_id.toString() + val.toString()] = m[tmp_id.toString() + val.toString()] + 1;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }    // 统计每个量表的位置都被填写了多少次

                                    var result_list = [];
                                    for (var k = 0; k < yarray.length; k++) {
                                        var tmp_id = yarray[k].id;
                                        for (var n = 0; n < xarray.length; n++) {
                                            var result_map = {};
                                            var val = xarray[n].val;
                                            if (m[tmp_id.toString() + val.toString()] == undefined) {
                                                result_map[tmp_id.toString() + "_" + n.toString()] = 0;
                                            }
                                            else {
                                                result_map[tmp_id.toString() + "_" + n.toString()] = m[tmp_id.toString() + val.toString()];
                                            }
                                            result_list.push(result_map);
                                        }
                                    }    // 统计每个量表的位置都被填写了多少次，把m换一种形式存在result_map中

                                    question_map['statistical'] = result_list;
                                    var setting = {};
                                    var y_axis_list = [];
                                    for (var k = 0; k < yarray.length; k++) {
                                        var tmp_map = {};
                                        var source = 0;
                                        var tmp_id = yarray[k].id;
                                        for (var n = 0; n < xarray.length; n++) {
                                            var val = xarray[n].val;
                                            var count = 0;
                                            if (m[tmp_id.toString() + val.toString()] != undefined) {
                                                count = m[tmp_id.toString() + val.toString()];
                                            }
                                            source = source + val * count;
                                        }
                                        tmp_map['id'] = yarray[k].id;
                                        tmp_map['left'] = yarray[k].left;
                                        tmp_map['right'] = yarray[k].right;
                                        tmp_map['avg'] = source / answer_detail_list.length;
                                        y_axis_list.push(tmp_map);
                                    }    // 求出量表每一行的平均值存下来
                                    setting['y_axis'] = y_axis_list;
                                    setting['x_axis'] = JSON.stringify(xarray);
                                    question_map['setting'] = setting;
                                    question_map['peoplecount'] = pcount;
                                }

                                else if (question_list[j].type == 4) {
                                    // 滑条题
                                    console.log('        滑条题');
                                    var yarray = ques_setting_obj.items;
                                    for (var k = 0; k < yarray.length; k++) {
                                        const id = yarray[k].id;
                                        const min_val = yarray[k].min_val;
                                        const max_val = yarray[k].max_val;
                                        const interval = parseInt(yarray[k].interval);
                                        console.log('            ', id, min_val, max_val, interval);
                                        for (var l = min_val; l <= max_val; l++) {
                                            if ((l - min_val) % interval == 0)
                                            {
                                                for (var n = 0; n < answer_detail_list.length; n++) {
                                                    if (answer_detail_list[n].isanswered == 1) {
                                                        const answer_content_obj = JSON.parse(answer_detail_list[n].reply_content);
                                                        const answers = answer_content_obj.answers;
                                                        for (var a = 0; a < answers.length; a++) {
                                                            if (id == answers[a].id && l == answers[a].value) {
                                                                if (m[id.toString() + l.toString()] == undefined) {
                                                                    m[id.toString() + l.toString()] = 1;
                                                                }
                                                                else {
                                                                    m[id.toString() + l.toString()] = m[id.toString() + l.toString()] + 1;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }    // 统计出每一项滑条中各个值的选择个数

                                    var result_list = [];
                                    for (var k = 0; k < yarray.length; k++) {
                                        var result_map = {};
                                        const id = yarray[k].id;
                                        const min_val = yarray[k].min_val;
                                        const max_val = yarray[k].max_val;
                                        const interval = parseInt(yarray[k].interval);
                                        const title = yarray[k].left;
                                        var source = 0;
                                        var data_map = {};
                                        for (var l = min_val; l <= max_val; l++) {
                                            if ((l - min_val) % interval == 0) {
                                                if (m[id.toString() + l.toString()] == undefined) {
                                                    data_map[l.toString()] = 0;
                                                }
                                                else {
                                                    source = source + l * m[id.toString() + l.toString()];
                                                    data_map[l.toString()] = m[id.toString() + l.toString()];
                                                }
                                            }
                                        }
                                        result_map['data'] = data_map;
                                        result_map['avg'] = source / answer_detail_list.length;
                                        result_map['id'] = id;
                                        result_map['title'] = title;
                                        result_list.push(result_map);
                                    }    // 分别统计出每个滑条每个值的个数，与评分的平均值
                                    question_map['statistical'] = result_list;
                                    question_map['setting'] = question_list[j].setting;
                                }
                            }

                            else {
                                // 填空题
                                console.log('        填空题');
                                var answer_list = [];
                                for (var k = 0; k < answer_detail_list.length; k++) {
                                    if (answer_detail_list[k].isanswered == 1) {
                                        var result_map = {};
                                        const answer_content_obj = answer_detail_list[k].reply_content;
                                        const s = answer_content_obj.answer;
                                        result_map['answer'] = s;
                                        result_map['time'] = answer_detail_list[k].created_on;
                                        answer_list.push(result_map);
                                    }
                                }
                                question_map['items'] = answer_list;
                            }
                            result_question_list.push(question_map);
                        }
                    }
                    paragraph_map['questionList'] = result_question_list;
                    final_array_list.push(paragraph_map);
                }
            }
            console.log('before final');
            final_map['title'] = survey_list[0].title;
            final_map['introduction'] = survey_list[0].introduction;
            final_map['paragraph'] = final_array_list;
            final_map['peoplecount'] = people_count;
            return final_map;
        }
        catch (error) {
            console.log('[service.survey.statistics.surveyStatistics]: error! --- ' + error);
            return -1;
        }
        return -1;
    }
}

module.exports = StatisticsService;