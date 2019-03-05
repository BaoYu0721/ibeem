'use strict';

const Service = require('egg').Service;

class SurveyService extends Service {
    async surveyList(){
        var survey = null;
        try {
            survey = await this.app.mysql.select('survey');
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in survey){
            var answerCount = null;
            try {
                answerCount = await this.app.mysql.query('select count(id) from answer where survey_id = ?', [survey[key].id]);
            } catch (error) {
                return -1;
            }
            const resultMap = {
                id: survey[key].id,
                title: survey[key].title == null? '': survey[key].title,
                introduction: survey[key].introduction == null? '': survey[key].introduction,
                name: survey[key].name == null? '': survey[key].name,
                count: answerCount[0]['count(id)'],
                state: survey[key].state,
                isFinished: survey[key].is_finished
            }
            resultList.push(resultMap);
        }
        return resultList;
    }

    async surveyDownloadAnswer(surveyId, sTime, eTime, relation, pbId){
        var result = null;
        try {
            if(relation == 0){
                result = await this.app.mysql.query('select * from answer where survey_id = ? and created_on > ? and created_on < ?', [surveyId, sTime, eTime]);
            }else if(relation == 1){
                result = await this.app.mysql.query('select * from answer where survey_id = ? and created_on > ? and created_on < ? and survey_relation_id in(select id from survey_relation where survey_id = ? and project_id = ?)', [surveyId, sTime, eTime, surveyId, pbId]);
            }else if(relation == 2){
                result = await this.app.mysql.query('select * from answer where survey_id = ? and created_on > ? and created_on < ? and survey_relation_id in(select id from survey_relation where survey_id = ? and building_id = ?)', [surveyId, sTime, eTime, surveyId, pbId]);
            }
        } catch (error) {
            return -1;
        }
        const resultList = [];
        for(var key in result){
            const resultMap = {
                time: result[key].created_on,
                ip: result[key].ip,
            }
            var surveyRelation = null;
            try {
                surveyRelation = await this.app.mysql.get('survey_relation', {id: result[key].survey_relation_id});
            } catch (error) {
                return -1;
            }
            if(surveyRelation != null){
                if(surveyRelation.relation == 1){
                    resultMap.surveyRelation = 1;
                    var project = null;
                    try {
                        project = await this.app.mysql.get('project', {id: surveyRelation.project_id});
                    } catch (error) {
                        return -1;
                    }
                    resultMap.name = project.name;
                }else if(surveyRelation.relation == 2){
                    resultMap.surveyRelation = 2;
                    var building = null;
                    try {
                        building = await this.app.mysql.get('building', {id: surveyRelation.building_id});
                    } catch (error) {
                        return -1;
                    }
                    resultMap.name = building.name;
                }else if(surveyRelation.relation == 3){
                    resultMap.surveyRelation = 3;
                    var buildingPoint = null;
                    try {
                        buildingPoint = await this.app.mysql.get('building_point', {id: surveyRelation.building_point_id});
                    } catch (error) {
                        return -1;
                    }
                    resultMap.name = buildingPoint.name;
                }
            }
            const answerDetailList = [];
            var answerDetail = null;
            try {
                answerDetail = await this.app.mysql.query('select * from answer_detail where answer_id = ? order by question_id', [result[key].id]);
            } catch (error) {
                return -1;
            }
            for(var i in answerDetail){
                const answerDetailMap = {
                questionid: answerDetail[i].question_id,
                content: answerDetail[i].reply_content
                };
                answerDetailList.push(answerDetailMap);
            }
            resultMap.answers = answerDetailList;
            resultList.push(resultMap);
        }
        return resultList;
    }

    async surveyDownloadQuestion(surveyId){
        var surveyResult = null;
        try {
            surveyResult = await this.app.mysql.get('survey', {id: surveyId});
        } catch (error) {
            return -1;
        }
        if(surveyResult == null) return null;
        const resultMap = {
            title: surveyResult.title,
            createTime: this.ctx.helper.dateFormat(surveyResult.created_on),
            introduction: surveyResult.introduction,
            surveyID: surveyResult.id,
            pagingType: surveyResult.type,
            pagingNum: surveyResult.number
        };
        const resList = [];
        var paragraphResult = null;
        try {
            paragraphResult = await this.app.mysql.query('select * from paragraph where survey_id = ? order by sequence', [surveyId]);
        } catch (error) {
            return -1;
        }
        if(paragraphResult.length == 0){
            const paragraphMap = {
                title: '',
                order: 1
            };
            var questionResult = null;
            try {
                questionResult = await this.app.mysql.query('select * from question where survey_id = ? order by sequence', [surveyId]);
            } catch (error) {
                return -1;
            }
            const questionList = [];
            for(var key in questionResult){
                const questionMap = {
                    questionID: questionResult[key].id,
                    required: questionResult[key].required,
                    sequence: questionResult[key].sequence,
                    setting: questionResult[key].setting,
                    title: questionResult[key].title,
                    type: questionResult[key].type
                };
                questionList.push(questionMap);
            }
            paragraphMap.questionList = questionList;
            resList.push(paragraphMap);
        }else{
            for(var key in paragraphResult){
              const paragraphMap = {
                title: paragraphResult[key].introduction,
                order: paragraphResult[key].sequence
              };
              var questionResult = null;
              try {
                  questionResult = await this.app.mysql.query('select * from question where survey_id = ? and paragraph_id = ? order by sequence', [surveyId, paragraphResult[key].id]);
              } catch (error) {
                  return -1;
              }
              const questionList = [];
              for(var i in questionResult){
                const questionMap = {
                    questionID: questionResult[i].id,
                    required: questionResult[i].required,
                    sequence: questionResult[i].sequence,
                    setting: questionResult[i].setting,
                    title: questionResult[i].title,
                    type: questionResult[i].type
                }
                questionList.push(questionMap);
              }
              paragraphMap.questionList = questionList;
              resList.push(paragraphMap);
            }
        }
        resultMap.list = resList;
        resultMap.code = 200;
        return resultMap;
    }

    async getSurveyById(surveyID){
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

    async getDimension(surveyID){
        try {
            var list = [];
            const project_list = await this.app.mysql.select('survey_relation', {where: {survey_id: surveyID}});
            var b_flag = false;
            for (var i = 0; i < project_list.length; i++) {
                var survey_relation = project_list[i];
                const tmp_pl = await this.app.mysql.select('project', {where: {id: survey_relation.project_id}});
                var project_map = {};
                b_flag = false;
                for (var j = 0; j < list.length; j++) {
                    if (list[j].projectName == tmp_pl[0].name) {
                        var click = list[j].click;
                        if (click != 0 && survey_relation.relation == 1) {
                            list[j].click = 0;
                        }
                        b_flag = true;
                        break;
                    }
                }
                if (b_flag == false) {
                    project_map['projectID'] = survey_relation.project_id;
                    project_map['projectName'] = tmp_pl[0].name;
                    if (survey_relation.relation == 1) {
                        // relation == 1 表示是和项目关联的问卷
                        project_map['click'] = 0;
                    }
                    else {
                        project_map['click'] = 1;
                    }
                    
                    var building_flag = false;
                    const building_list = await this.app.mysql.query('select * from survey_relation where survey_id=? and relation!=1 and project_id=?', 
                        [surveyID, survey_relation.project_id]);
                    var result_building_list = [];
                    for (var j = 0; j < building_list.length; j++) {
                        var building_survey_relation = building_list[j];
                        var tmp_bl = await this.app.mysql.select('building', {where: {id: building_survey_relation.building_id}});
                        var building_map = {};
                        building_flag = false;
                        for (var k = 0; k < result_building_list.length; k++) {
                            if (result_building_list[k].buildingName == tmp_bl[0].name) {
                                var click = result_building_list[k].click;
                                if (click != 0 && survey_relation.relation == 1) {
                                    result_building_list[k].click = 0;
                                }
                                b_flag = true;
                                break;
                            }
                        }
                        if (building_flag == false) {
                            const building_id = building_survey_relation.building_id;
                            building_map['buildingID'] = building_id;
                            building_map['buildingName'] = tmp_bl[0].name;
                            if (building_survey_relation.relation == 2) {
                                building_map['click'] = 0;
                            }
                            else {
                                building_map['click'] = 1;
                            }
                            const building_point_list = await this.app.mysql.query('select * from survey_relation where relation=3 and survey_id=? and project_id=? and building_id=?',
                                [surveyID, survey_relation.project_id, building_id]);
                            var result_building_point_list = [];
                            for (var k = 0; k < building_point_list.length; k++) {
                                var building_point_survey_relation = building_point_list[k];
                                var building_point_map = {};
                                building_point_map['buildingPointID'] = building_point_survey_relation.building_point_id;
                                const tmp_bpl = await this.app.mysql.select('building_point', {where: {id: building_point_survey_relation.building_point_id}});
                                building_point_map['buildingName'] = tmp_bpl[0].name;
                                if (building_point_survey_relation.relation == 3) {
                                    building_point_map['click'] = 0;
                                }
                                else {
                                    building_point_map['click'] = 1;
                                }
                                result_building_list.push(building_point_map);
                            }
                            building_map['buildingPointList'] = result_building_point_list;
                            result_building_list.push(building_map);
                        }
                    }
                    project_map['buildingList'] = result_building_list;
                    list.push(project_map);
                }
            }
            return list;
        }
        catch (error) {
            console.log('[service.survey.analyze.getDimension]: error! --- ' + error);
            return -1;
        }
    }

    async analysisSurvey(surveyID, zid, yid, type, beginTime, endTime, relation, objectID){
        var result = {};
        var is_no_data = 1;
        try {
            if (type == "project") {
                // 自变量选“项目”的
                const list = await this.app.mysql.select('project_survey', {where: {survey_id: surveyID}});
                if (list != null && list.length != 0) {
                    result['isNotRelated'] = 0;
                    const yquestion = await this.app.mysql.get('question', {id: yid});
                    if (yquestion.type == 1) {
                        // 单选题
                        var yquestion_json = JSON.parse(yquestion.setting);
                        var yarray = yquestion_json.items;
                        for (var i = 0; i < list.length; i++) {
                            var project_survey = list[i];
                            var map = {};
                            const project = await this.app.mysql.get('project', {id: project_survey.project_id});
                            const project_name = project.name;
                            const project_id = project_survey.project_id;

                            // answerDetailDao.getListByQuestion(yid,surveyID,projectId,1,startTime,endTime)
                            const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, project_id, 1, beginTime, endTime);
                            if (yanswer_detail_list == -1) {
                                return -1;
                            }

                            if (yanswer_detail_list.length != 0) {
                                is_no_data = 0;
                                for (var j = 0; j < yarray.length; j++) {
                                    map[yarray[j].text] = 0;
                                }
                                for (var j = 0; j < yarray.length; j++) {
                                    var id = yarray[j].id;
                                    for (var k = 0; k < yanswer_detail_list.length; k++) {
                                        if (yanswer_detail_list[k].isanswered == 1) {
                                            const answer_json = JSON.parse(yanswer_detail_list[k].reply_content);
                                            if (id == answer_json.id) {
                                                map[yarray[j].text] = map[yarray[j].text] + 1;
                                            }
                                        }
                                    }
                                }
                            }
                            result[project_name] = map;
                        }
                        result['isNoData'] = is_no_data;
                    }
                    else if (yquestion.type == 2) {
                        // 多选题
                        var yquestion_json = JSON.parse(yquestion.setting);
                        var yarray = yquestion_json.items;
                        for (var i = 0; i < list.length; i++) {
                            var project_survey = list[i];
                            var map = {};
                            const project = await this.app.mysql.get('project', {id: project_survey.project_id});
                            const project_name = project.name;
                            const project_id = project_survey.project_id;

                            // answerDetailDao.getListByQuestion(yid,surveyID,projectId,1,startTime,endTime)
                            const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, project_id, 1, beginTime, endTime);
                            if (yanswer_detail_list == -1) {
                                return -1;
                            }

                            if (yanswer_detail_list.length != 0) {
                                is_no_data = 0;
                                for (var j = 0; j < yarray.length; j++) {
                                    map[yarray[j].text] = 0;
                                }
                                for (var j = 0; j < yarray.length; j++) {
                                    var id = yarray[j].id;
                                    for (var k = 0; k < yanswer_detail_list.length; k++) {
                                        if (yanswer_detail_list[k].isanswered == 1) {
                                            const yanswer_json = JSON.parse(yanswer_detail_list[k].reply_content);
                                            const yanswers = yanswer_json.answers;
                                            for (var l = 0; l < yanswers.length; l++) {
                                                if (id == yanswers[l].id) {
                                                    map[yarray[j].text] = map[yarray[j].text] + 1;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            result[project_name] = map;
                        }
                        result['isNoData'] = is_no_data;
                    }
                    else if (yquestion.type == 0) {
                        // 填空题
                        var result_list = [];
                        for (var i = 0; i < list.length; i++) {
                            var project_survey = list[i];
                            var text_list = [];
                            var map = {};
                            const project = await this.app.mysql.get('project', {id: project_survey.project_id});
                            const project_name = project.name;
                            const project_id = project_survey.project_id;
                            map['id'] = project_id;
                            // answerDetailDao.getListByQuestion(yid,surveyID,projectId,1,startTime,endTime)
                            const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, project_id, 1, beginTime, endTime);
                            if (yanswer_detail_list == -1) {
                                return -1;
                            }

                            if (yanswer_detail_list.length != 0) {
                                is_no_data = 0;
                                for (var j = 0; j < yanswer_detail_list.length; j++) {
                                    if (yanswer_detail_list[j].isanswered == 1) {
                                        var m = {};
                                        const reply_content = JSON.parse(yanswer_detail_list[j].reply_content);
                                        const answer = reply_content.answer;
                                        const tmp_date = new Date(yanswer_detail_list[j].created_on);
                                        const date_str = tmp_date.getFullYear() + '-' + (tmp_date.getMonth()+1) + '-' + tmp_date.getDate() + ' ' + tmp_date.getHours() + ':' + tmp_date.getMinutes() + ':' + tmp_date.getSeconds();
                                        m['time'] = date_str;
                                        m['answer'] = answer;
                                        text_list.push(m);
                                    }
                                }
                            }

                            map['textlist'] = text_list;
                            result_list.push(map);
                        }
                        result['isNoData'] = is_no_data;
                        result['analysis'] = result_list;
                    }
                    else if (yquestion.type == 3) {
                        // 量表题
                        const yquestion_json = JSON.parse(yquestion.setting);
                        const yarray = yquestion_json.y_axis;
                        const xarray = yquestion_json.x_axis;
                        for (var i = 0; i < yarray.length; i++) {
                            var m = {};
                            const id = yarray[i].id;
                            for (var j = 0; j < list.length; j++) {
                                const project_survey = list[j];
                                const project = await this.app.mysql.get('project', {id: project_survey.project_id});
                                const project_name = project.name;
                                const project_id = project_survey.project_id;
                                // answerDetailDao.getListByQuestion(yid,surveyID,projectId,1,startTime,endTime)
                                const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, project_id, 1, beginTime, endTime);
                                if (yanswer_detail_list == -1) {
                                    return -1;
                                }
                                var zm = {};
                                if (yanswer_detail_list.length != 0) {
                                    is_no_data = 0;
                                    for (var k = 0; k < xarray.length; k++) {
                                        zm[xarray[k].tag] = 0;
                                    }
                                    for (var k = 0; k < yanswer_detail_list.length; k++) {
                                        if (yanswer_detail_list[k].isanswered == 1) {
                                            const yanswer_json = JSON.parse(yanswer_detail_list[k].reply_content);
                                            const answers = yanswer_json.answers;
                                            for (var l = 0; l < xarray.length; l++) {
                                                const val = xarray[l].val;
                                                for (var n = 0; n < answers.length; n++) {
                                                    if (id == answers[n].id && val == answers[n].val) {
                                                        zm[xarray[l].tag] = zm[xarray[l].tag] + 1;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    m[project_name] = zm;
                                }
                            }
                            result[yarray[i].left] = m;
                        }
                        result['isNoData'] = is_no_data;
                    }
                    else if (yquestion.type == 4) {
                        // 滑条题
                        const yquestion_json = JSON.parse(yquestion.setting);
                        var yarray = yquestion_json.items;
                        for (var i = 0; i < yarray.length; i++) {
                            var map = {};
                            const id = yarray[i].id;
                            const min_val = yarray[i].min_val;
                            const max_val = yarray[i].max_val;
                            const interval = yarray[i].interval;
                            const left = yarray[i].left;
                            for (var j = 0; j < list.length; j++) {
                                const project_survey = list[j];
                                var m = {};
                                const project = await this.app.mysql.get('project', {id: project_survey.project_id});
                                const project_name = project.name;
                                const project_id = project_survey.project_id;
                                for (var k = min_val; k <= max_val; k++) {
                                    if ((k - min_val) % interval == 0) {
                                        m[k.toString()] = 0;
                                    }
                                }
                                // answerDetailDao.getListByQuestion(yid,surveyID,projectId,1,startTime,endTime)
                                const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, project_id, 1, beginTime, endTime);
                                if (yanswer_detail_list == -1) {
                                    return -1;
                                }

                                if (yanswer_detail_list.length != 0) {
                                    is_no_data = 0;
                                    for (var l = 0; l < yanswer_detail_list.length; l++) {
                                        if (yanswer_detail_list[l].isanswered == 1) {
                                            const yanswer_json = JSON.parse(yanswer_detail_list[l].reply_content);
                                            const answers = yanswer_json.answers;
                                            for (var n = min_val; n <= max_val; n++) {
                                                if ((n - min_val) % interval == 0) {
                                                    for (var a = 0; a < answers.length; a++) {
                                                        if (id == answers[a].id && n == answers[a].value) {
                                                            m[n.toString()] = m[n.toString()] + 1;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    map[project_name] = m;
                                }
                            }
                            result[left] = map;
                        }
                    }
                    result['isNoData'] = is_no_data;
                }
                else {
                    result['isNotRelated'] = 1;
                }
            }
            else if (type == "building") {
                // List<BuildingSurvey> list = buildingSurveyService.getListBySurveyAndRelation(surveyID,relation,objectID);
                var list = null;
                if (relation == 0) {
                    list = await this.app.mysql.select('building_survey', {where: {survey_id: surveyID}});
                }
                else if (relation == 1) {
                    list = await this.app.mysql.query('select * from building_survey where survey_id=? and building_id in (select id from building where project_id=?)',
                        [surveyID, objectID]);
                }
                
                if (list != null && list.length != 0) {
                    result['isNotRelated'] = 0;
                    const yquestion = await this.app.mysql.get('question', {id: yid});
                    if (yquestion.type == 1) {
                        // 单选题
                        var yquestion_json = JSON.parse(yquestion.setting);
                        var yarray = yquestion_json.items;
                        for (var i = 0; i < list.length; i++) {
                            var building_survey = list[i];
                            var map = {};
                            const building = await this.app.mysql.get('building', {id: building_survey.building_id});
                            const building_name = building.name;
                            const building_id = building_survey.building_id;

                            // answerDetailDao.getListByQuestion(yid,surveyID,buildingId,2,startTime,endTime)
                            const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, building_id, 2, beginTime, endTime);
                            if (yanswer_detail_list == -1) {
                                return -1;
                            }

                            if (yanswer_detail_list.length != 0) {
                                is_no_data = 0;
                                for (var j = 0; j < yarray.length; j++) {
                                    map[yarray[j].text] = 0;
                                }
                                for (var j = 0; j < yarray.length; j++) {
                                    var id = yarray[j].id;
                                    for (var k = 0; k < yanswer_detail_list.length; k++) {
                                        if (yanswer_detail_list[k].isanswered == 1) {
                                            const answer_json = JSON.parse(yanswer_detail_list[k].reply_content);
                                            if (id == answer_json.id) {
                                                map[yarray[j].text] = map[yarray[j].text] + 1;
                                            }
                                        }
                                    }
                                }
                            }
                            result[building_name] = map;
                        }
                        result['isNoData'] = is_no_data;
                    }
                    else if (yquestion.type == 2) {
                        // 多选题
                        var yquestion_json = JSON.parse(yquestion.setting);
                        var yarray = yquestion_json.items;
                        for (var i = 0; i < list.length; i++) {
                            var building_survey = list[i];
                            var map = {};
                            const building = await this.app.mysql.get('building', {id: building_survey.building_id});
                            const building_name = building.name;
                            const building_id = building_survey.building_id;

                            // answerDetailDao.getListByQuestion(yid,surveyID,buildingId,2,startTime,endTime)
                            const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, building_id, 2, beginTime, endTime);
                            if (yanswer_detail_list == -1) {
                                return -1;
                            }

                            if (yanswer_detail_list.length != 0) {
                                is_no_data = 0;
                                for (var j = 0; j < yarray.length; j++) {
                                    map[yarray[j].text] = 0;
                                }
                                for (var j = 0; j < yarray.length; j++) {
                                    var id = yarray[j].id;
                                    for (var k = 0; k < yanswer_detail_list.length; k++) {
                                        if (yanswer_detail_list[k].isanswered == 1) {
                                            const yanswer_json = JSON.parse(yanswer_detail_list[k].reply_content);
                                            const yanswers = yanswer_json.answers;
                                            for (var l = 0; l < yanswers.length; l++) {
                                                if (id == yanswers[l].id) {
                                                    map[yarray[j].text] = map[yarray[j].text] + 1;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            result[building_name] = map;
                        }
                        result['isNoData'] = is_no_data;
                    }
                    else if (yquestion.type == 0) {
                        // 填空题
                        var result_list = [];
                        for (var i = 0; i < list.length; i++) {
                            var building_survey = list[i];
                            var text_list = [];
                            var map = {};
                            const building = await this.app.mysql.get('building', {id: building_survey.building_id});
                            const building_name = building.name;
                            const building_id = building_survey.building_id;
                            map['id'] = building_id;
                            // answerDetailDao.getListByQuestion(yid,surveyID,buildingId,2,startTime,endTime)
                            const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, building_id, 2, beginTime, endTime);
                            if (yanswer_detail_list == -1) {
                                return -1;
                            }

                            if (yanswer_detail_list.length != 0) {
                                is_no_data = 0;
                                for (var j = 0; j < yanswer_detail_list.length; j++) {
                                    if (yanswer_detail_list[j].isanswered == 1) {
                                        var m = {};
                                        const reply_content = JSON.parse(yanswer_detail_list[j].reply_content);
                                        const answer = reply_content.answer;
                                        const tmp_date = new Date(yanswer_detail_list[j].created_on);
                                        const date_str = tmp_date.getFullYear() + '-' + (tmp_date.getMonth()+1) + '-' + tmp_date.getDate() + ' ' + tmp_date.getHours() + ':' + tmp_date.getMinutes() + ':' + tmp_date.getSeconds();
                                        m['time'] = date_str;
                                        m['answer'] = answer;
                                        text_list.push(m);
                                    }
                                }
                            }

                            map['textlist'] = text_list;
                            result_list.push(map);
                        }
                        result['isNoData'] = is_no_data;
                        result['analysis'] = result_list;
                    }
                    else if (yquestion.type == 3) {
                        // 量表题
                        const yquestion_json = JSON.parse(yquestion.setting);
                        const yarray = yquestion_json.y_axis;
                        const xarray = yquestion_json.x_axis;
                        for (var i = 0; i < yarray.length; i++) {
                            var m = {};
                            const id = yarray[i].id;
                            for (var j = 0; j < list.length; j++) {
                                const building_survey = list[j];
                                const building = await this.app.mysql.get('building', {id: building_survey.building_id});
                                const building_name = building.name;
                                const building_id = building_survey.building_id;
                                // answerDetailDao.getListByQuestion(yid,surveyID,buildingId,2,startTime,endTime)
                                const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, building_id, 2, beginTime, endTime);
                                if (yanswer_detail_list == -1) {
                                    return -1;
                                }
                                var zm = {};
                                if (yanswer_detail_list.length != 0) {
                                    is_no_data = 0;
                                    for (var k = 0; k < xarray.length; k++) {
                                        zm[xarray[k].tag] = 0;
                                    }
                                    for (var k = 0; k < yanswer_detail_list.length; k++) {
                                        if (yanswer_detail_list[k].isanswered == 1) {
                                            const yanswer_json = JSON.parse(yanswer_detail_list[k].reply_content);
                                            const answers = yanswer_json.answers;
                                            for (var l = 0; l < xarray.length; l++) {
                                                const val = xarray[l].val;
                                                for (var n = 0; n < answers.length; n++) {
                                                    if (id == answers[n].id && val == answers[n].val) {
                                                        zm[xarray[l].tag] = zm[xarray[l].tag] + 1;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    m[building_name] = zm;
                                }
                            }
                            result[yarray[i].left] = m;
                        }
                        result['isNoData'] = is_no_data;
                    }
                    else if (yquestion.type == 4) {
                        // 滑条题
                        const yquestion_json = JSON.parse(yquestion.setting);
                        var yarray = yquestion_json.items;
                        for (var i = 0; i < yarray.length; i++) {
                            var map = {};
                            const id = yarray[i].id;
                            const min_val = yarray[i].min_val;
                            const max_val = yarray[i].max_val;
                            const interval = yarray[i].interval;
                            const left = yarray[i].left;
                            for (var j = 0; j < list.length; j++) {
                                const building_survey = list[j];
                                var m = {};
                                const building = await this.app.mysql.get('building', {id: building_survey.building_id});
                                const building_name = building.name;
                                const building_id = building_survey.building_id;
                                for (var k = min_val; k <= max_val; k++) {
                                    if ((k - min_val) % interval == 0) {
                                        m[k.toString()] = 0;
                                    }
                                }
                                // answerDetailDao.getListByQuestion(yid,surveyID,buildingId,2,startTime,endTime)
                                const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, building_id, 2, beginTime, endTime);
                                if (yanswer_detail_list == -1) {
                                    return -1;
                                }

                                if (yanswer_detail_list.length != 0) {
                                    is_no_data = 0;
                                    for (var l = 0; l < yanswer_detail_list.length; l++) {
                                        if (yanswer_detail_list[l].isanswered == 1) {
                                            const yanswer_json = JSON.parse(yanswer_detail_list[l].reply_content);
                                            const answers = yanswer_json.answers;
                                            for (var n = min_val; n <= max_val; n++) {
                                                if ((n - min_val) % interval == 0) {
                                                    for (var a = 0; a < answers.length; a++) {
                                                        if (id == answers[a].id && n == answers[a].value) {
                                                            m[n.toString()] = m[n.toString()] + 1;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    map[building_name] = m;
                                }
                            }
                            result[left] = map;
                        }
                    }
                    result['isNoData'] = is_no_data;
                }
                else {
                    result['isNotRelated'] = 1;
                }
            }
            else if (type == 'buildingPoint') {
                var list = null;
                if (relation == 0) {
                    list = await this.app.mysql.select('building_point_survey', {where: {survey_id: surveyID}});
                }
                else if (relation == 1) {
                    list = await this.app.mysql.query('select * from building_point_survey where survey_id=? and building_point_id in (select id from building_point where building_id in (select id from building where project_id=?))',
                        [surveyID, objectID]);
                }
                else if (relation == 2) {
                    list = await this.app.mysql.query('select * from building_point_survey where survey_id=? and building_point_id in (select id from building_point where building_id=?)',
                        [surveyID, objectID]);
                }
                
                if (list != null && list.length != 0) {
                    result['isNotRelated'] = 0;
                    const yquestion = await this.app.mysql.get('question', {id: yid});
                    if (yquestion.type == 1) {
                        // 单选题
                        var yquestion_json = JSON.parse(yquestion.setting);
                        var yarray = yquestion_json.items;
                        for (var i = 0; i < list.length; i++) {
                            var building_point_survey = list[i];
                            var map = {};
                            const building_point = await this.app.mysql.get('building_point', {id: building_point_survey.building_point_id});
                            const building_point_name = building_point.name;
                            const building_point_id = building_point_survey.building_point_id;

                            // answerDetailDao.getListByQuestion(yid,surveyID,buildingPointId,3,startTime,endTime);
                            const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, building_point_id, 3, beginTime, endTime);
                            if (yanswer_detail_list == -1) {
                                return -1;
                            }

                            if (yanswer_detail_list.length != 0) {
                                is_no_data = 0;
                                for (var j = 0; j < yarray.length; j++) {
                                    map[yarray[j].text] = 0;
                                }
                                for (var j = 0; j < yarray.length; j++) {
                                    var id = yarray[j].id;
                                    for (var k = 0; k < yanswer_detail_list.length; k++) {
                                        if (yanswer_detail_list[k].isanswered == 1) {
                                            const answer_json = JSON.parse(yanswer_detail_list[k].reply_content);
                                            if (id == answer_json.id) {
                                                map[yarray[j].text] = map[yarray[j].text] + 1;
                                            }
                                        }
                                    }
                                }
                            }
                            result[building_point_name] = map;
                        }
                        result['isNoData'] = is_no_data;
                    }
                    else if (yquestion.type == 2) {
                        // 多选题
                        var yquestion_json = JSON.parse(yquestion.setting);
                        var yarray = yquestion_json.items;
                        for (var i = 0; i < list.length; i++) {
                            var building_point_survey = list[i];
                            var map = {};
                            const building_point = await this.app.mysql.get('building_point', {id: building_point_survey.building_point_id});
                            const building_point_name = building_point.name;
                            const building_point_id = building_point_survey.building_point_id;

                            // answerDetailDao.getListByQuestion(yid,surveyID,buildingPointId,3,startTime,endTime);
                            const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, building_point_id, 3, beginTime, endTime);
                            if (yanswer_detail_list == -1) {
                                return -1;
                            }

                            if (yanswer_detail_list.length != 0) {
                                is_no_data = 0;
                                for (var j = 0; j < yarray.length; j++) {
                                    map[yarray[j].text] = 0;
                                }
                                for (var j = 0; j < yarray.length; j++) {
                                    var id = yarray[j].id;
                                    for (var k = 0; k < yanswer_detail_list.length; k++) {
                                        if (yanswer_detail_list[k].isanswered == 1) {
                                            const yanswer_json = JSON.parse(yanswer_detail_list[k].reply_content);
                                            const yanswers = yanswer_json.answers;
                                            for (var l = 0; l < yanswers.length; l++) {
                                                if (id == yanswers[l].id) {
                                                    map[yarray[j].text] = map[yarray[j].text] + 1;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            result[building_point_name] = map;
                        }
                        result['isNoData'] = is_no_data;
                    }
                    else if (yquestion.type == 0) {
                        // 填空题
                        var result_list = [];
                        for (var i = 0; i < list.length; i++) {
                            var building_point_survey = list[i];
                            var text_list = [];
                            var map = {};
                            const building_point = await this.app.mysql.get('building_point', {id: building_point_survey.building_point_id});
                            const building_point_name = building_point.name;
                            const building_point_id = building_point_survey.building_point_id;
                            map['id'] = building_point_id;
                            // answerDetailDao.getListByQuestion(yid,surveyID,buildingPointId,3,startTime,endTime);
                            const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, building_point_id, 3, beginTime, endTime);
                            if (yanswer_detail_list == -1) {
                                return -1;
                            }

                            if (yanswer_detail_list.length != 0) {
                                is_no_data = 0;
                                for (var j = 0; j < yanswer_detail_list.length; j++) {
                                    if (yanswer_detail_list[j].isanswered == 1) {
                                        var m = {};
                                        const reply_content = JSON.parse(yanswer_detail_list[j].reply_content);
                                        const answer = reply_content.answer;
                                        const tmp_date = new Date(yanswer_detail_list[j].created_on);
                                        const date_str = tmp_date.getFullYear() + '-' + (tmp_date.getMonth()+1) + '-' + tmp_date.getDate() + ' ' + tmp_date.getHours() + ':' + tmp_date.getMinutes() + ':' + tmp_date.getSeconds();
                                        m['time'] = date_str;
                                        m['answer'] = answer;
                                        text_list.push(m);
                                    }
                                }
                            }

                            map['textlist'] = text_list;
                            result_list.push(map);
                        }
                        result['isNoData'] = is_no_data;
                        result['analysis'] = result_list;
                    }
                    else if (yquestion.type == 3) {
                        // 量表题
                        const yquestion_json = JSON.parse(yquestion.setting);
                        const yarray = yquestion_json.y_axis;
                        const xarray = yquestion_json.x_axis;
                        for (var i = 0; i < yarray.length; i++) {
                            var m = {};
                            const id = yarray[i].id;
                            for (var j = 0; j < list.length; j++) {
                                const building_point_survey = list[j];
                                const building_point = await this.app.mysql.get('building_point', {id: building_point_survey.building_point_id});
                                const building_point_name = building_point.name;
                                const building_point_id = building_point_survey.building_point_id;
                                // answerDetailDao.getListByQuestion(yid,surveyID,buildingPointId,3,startTime,endTime);
                                const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, building_point_id, 3, beginTime, endTime);
                                if (yanswer_detail_list == -1) {
                                    return -1;
                                }
                                var zm = {};
                                if (yanswer_detail_list.length != 0) {
                                    is_no_data = 0;
                                    for (var k = 0; k < xarray.length; k++) {
                                        zm[xarray[k].tag] = 0;
                                    }
                                    for (var k = 0; k < yanswer_detail_list.length; k++) {
                                        if (yanswer_detail_list[k].isanswered == 1) {
                                            const yanswer_json = JSON.parse(yanswer_detail_list[k].reply_content);
                                            const answers = yanswer_json.answers;
                                            for (var l = 0; l < xarray.length; l++) {
                                                const val = xarray[l].val;
                                                for (var n = 0; n < answers.length; n++) {
                                                    if (id == answers[n].id && val == answers[n].val) {
                                                        zm[xarray[l].tag] = zm[xarray[l].tag] + 1;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    m[building_point_name] = zm;
                                }
                            }
                            result[yarray[i].left] = m;
                        }
                        result['isNoData'] = is_no_data;
                    }
                    else if (yquestion.type == 4) {
                        // 滑条题
                        const yquestion_json = JSON.parse(yquestion.setting);
                        var yarray = yquestion_json.items;
                        for (var i = 0; i < yarray.length; i++) {
                            var map = {};
                            const id = yarray[i].id;
                            const min_val = yarray[i].min_val;
                            const max_val = yarray[i].max_val;
                            const interval = yarray[i].interval;
                            const left = yarray[i].left;
                            for (var j = 0; j < list.length; j++) {
                                const building_point_survey = list[j];
                                var m = {};
                                const building_point = await this.app.mysql.get('building_point', {id: building_point_survey.building_point_id});
                                const building_point_name = building_point.name;
                                const building_point_id = building_point_survey.building_point_id;
                                for (var k = min_val; k <= max_val; k++) {
                                    if ((k - min_val) % interval == 0) {
                                        m[k.toString()] = 0;
                                    }
                                }
                                // answerDetailDao.getListByQuestion(yid,surveyID,buildingPointId,3,startTime,endTime);
                                const yanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestion(yid, surveyID, building_point_id, 3, beginTime, endTime);
                                if (yanswer_detail_list == -1) {
                                    return -1;
                                }

                                if (yanswer_detail_list.length != 0) {
                                    is_no_data = 0;
                                    for (var l = 0; l < yanswer_detail_list.length; l++) {
                                        if (yanswer_detail_list[l].isanswered == 1) {
                                            const yanswer_json = JSON.parse(yanswer_detail_list[l].reply_content);
                                            const answers = yanswer_json.answers;
                                            for (var n = min_val; n <= max_val; n++) {
                                                if ((n - min_val) % interval == 0) {
                                                    for (var a = 0; a < answers.length; a++) {
                                                        if (id == answers[a].id && n == answers[a].value) {
                                                            m[n.toString()] = m[n.toString()] + 1;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    map[building_point_name] = m;
                                }
                            }
                            result[left] = map;
                        }
                    }
                    result['isNoData'] = is_no_data;
                }
                else {
                    result['isNotRelated'] = 1;
                }
            }
            else {
                // 自变量问题
                const zquestion = await this.app.mysql.get('question', {id: zid});
                // 因变量问题
                const yquestion = await this.app.mysql.get('question', {id: yid});
                if (zquestion.type == 1) {
                    // 单选题
                    // zanswerDetailList = answerDetailDao.getListByQuestionAndRelation(zquestion.getId(),surveyID,startTime,endTime,relation,objectID)
                    const zanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestionAndRelation(zquestion.id, surveyID, beginTime, endTime, relation, objectID);
                    if (zanswer_detail_list == -1) {
                        return -1;
                    }
                    const zquestion_json = JSON.parse(zquestion.setting);
                    var zarray = zquestion_json.items;
                    if (yquestion.type == 1) {
                        // 单选题
                        var yquestion_json = JSON.parse(yquestion.setting);
                        var yarray = yquestion_json.items;
                        for (var i = 0; i < zarray.length; i++) {
                            var map = {};
                            for (var j = 0; j < yarray.length; j++) {
                                map[yarray[j].text] = 0;
                            }
                            var id = zarray[i].id;
                            for (var j = 0; j < zanswer_detail_list.length; j++) {
                                const answer_detail = zanswer_detail_list[j];
                                if (answer_detail.isanswered == 1) {
                                    const answer_json = JSON.parse(answer_detail.reply_content);
                                    if (id == answer_json.id) {
                                        const yanswer_detail = await this.service.survey.answer.answerDetailGetAnswerDetailByUserAndQuestion(answer_detail.answer_id, yid);
                                        if (yanswer_detail.isanswered == 1) {
                                            const yanswer_json = JSON.parse(yanswer_detail.reply_content);
                                            const yaid = yanswer_json.id;
                                            for (var k = 0; k < yarray.length; k++) {
                                                const yqid = yarray[k].id;
                                                if (yaid == yqid) {
                                                    map[yarray[k].text] = map[yarray[k].text] + 1;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            result[zarray[i].text] = map;
                        }
                    }
                    else if (yquestion.type == 2) {
                        // 多选题
                        const yquestion_json = JSON.parse(yquestion.setting);
                        const yarray = yquestion_json.items;
                        for (var i = 0; i < zarray.length; i++) {
                            var map = {};
                            for (var j = 0; j < yarray.length; j++) {
                                map[yarray[j].text] = 0;
                            }
                            var id = zarray[i].id;
                            for (var j = 0; j < zanswer_detail_list.length; j++) {
                                const answer_detail = zanswer_detail_list[j];
                                if (answer_detail.isanswered == 1) {
                                    const answer_json = JSON.parse(answer_detail.reply_content);
                                    if (id == answer_json.id) {
                                        const yanswer_detail = await this.service.survey.answer.answerDetailGetAnswerDetailByUserAndQuestion(answer_detail.answer_id, yid);
                                        if (yanswer_detail.isanswered == 1) {
                                            const yanswer_json = JSON.parse(yanswer_detail.reply_content);
                                            const yanswers = yanswer_json.answers;
                                            for (var k = 0; k < yarray.length; k++) {
                                                const yqid = yarray[k].id;
                                                for (var l = 0; l < yanswers.length; l++) {
                                                    if (yqid == yanswers[l].id) {
                                                        map[yarray[k].text] = map[yarray[k].text] + 1;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            result[zarray[i].text] = map;
                        }
                    }
                    else if (yquestion.type == 0) {
                        // 填空题
                        var list = [];
                        for (var i = 0; i < zarray.length; i++) {
                            var text_list = [];
                            var map = {};
                            const id = zarray[i].id;
                            map['id'] = id;
                            for (var j = 0; j < zanswer_detail_list.length; j++) {
                                const answer_detail = zanswer_detail_list[j];
                                if (answer_detail.isanswered == 1) {
                                    const answer_json = JSON.parse(answer_detail.reply_content);
                                    if (id == answer_json.id) {
                                        const yanswer_detail = await this.service.survey.answer.answerDetailGetAnswerDetailByUserAndQuestion(answer_detail.answer_id, yid);
                                        if (yanswer_detail != null) {
                                            if (yanswer_detail.isanswered == 1) {
                                                var m = {};
                                                const reply_content = JSON.parse(yanswer_detail.reply_content);
                                                const answer = reply_content.answer;
                                                const tmp_date = new Date(yanswer_detail.created_on);
                                                const date_str = tmp_date.getFullYear() + '-' + (tmp_date.getMonth()+1) + '-' + tmp_date.getDate() + ' ' + tmp_date.getHours() + ':' + tmp_date.getMinutes() + ':' + tmp_date.getSeconds();
                                                m['time'] = date_str;
                                                m['answer'] = answer;
                                                text_list.push(m);
                                            }
                                        }
                                    }
                                }
                            }
                            map['textlist'] = text_list;
                            list.push(map);
                        }
                        result['analysis'] = list;
                    }
                    else if (yquestion.type == 3) {
                        // 量表题
                        const yquestion_json = JSON.parse(yquestion.setting);
                        const yarray = yquestion_json.y_axis;
                        const xarray = yquestion_json.x_axis;
                        for (var i = 0; i < yarray.length; i++) {
                            var m = {};
                            const id = yarray[i].id;
                            for (var j = 0; j < zarray.length; j++) {
                                const z_item_id = zarray[j].id;
                                var zm = {};
                                for (var k = 0; k < xarray.length; k++) {
                                    zm[xarray[k].tag] = 0;
                                }
                                for (var k = 0; k < zanswer_detail_list.length; k++) {
                                    const answer_detail = zanswer_detail_list[k];
                                    if (answer_detail.isanswered == 1) {
                                        const answer_json = JSON.parse(answer_detail.reply_content);
                                        if (z_item_id == answer_json.id) {
                                            const yanswer_detail = await this.service.survey.answer.answerDetailGetAnswerDetailByUserAndQuestion(answer_detail.answer_id, yid);
                                            if (yanswer_detail.isanswered == 1) {
                                                const yanswer_json = JSON.parse(yanswer_detail.reply_content);
                                                const answers = yanswer_json.answers;
                                                for (var l = 0; l < xarray.length; l++) {
                                                    const val = xarray[l].val;
                                                    for (var n = 0; n < answers.length; n++) {
                                                        if (id == answers[n].id && val == answers[n].val) {
                                                            zm[xarray[l].tag] = zm[xarray[l].tag] + 1;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                m[zarray[j].text] = zm;
                            }
                            result[yarray[i].left] = m;
                        }
                    }
                    else if (yquestion.type == 4) {
                        // 滑条题
                        const yquestion_json = JSON.parse(yquestion.setting);
                        const yarray = yquestion_json.items;
                        for (var i = 0; i < yarray.length; i++) {
                            var map = {};
                            const id = yarray[i].id;
                            const min_val = yarray[i].min_val;
                            const max_val = yarray[i].max_val;
                            const interval = yarray[i].interval;
                            const left = yarray[i].left;
                            for (var j = 0; j < zarray.length; j++) {
                                var m = {};
                                const zqid = zarray[j].id;
                                const text = zarray[j].text;
                                for (var k = min_val; k <= max_val; k++) {
                                    if ((k - min_val) % interval == 0) {
                                        m[k.toString()] = 0;
                                    }
                                }
                                for (var k = 0; k < zanswer_detail_list.length; k++) {
                                    const answer_detail = zanswer_detail_list[k];
                                    if (answer_detail.isanswered == 1) {
                                        const answer_json = JSON.parse(answer_detail.reply_content);
                                        if (zqid == answer_json.id) {
                                            const yanswer_detail = await this.service.survey.answer.answerDetailGetAnswerDetailByUserAndQuestion(answer_detail.answer_id, yid);
                                            if (yanswer_detail.isanswered == 1) {
                                                const yanswer_json = JSON.parse(yanswer_detail.reply_content);
                                                const answers = yanswer_json.answers;
                                                for (var l = min_val; l <= max_val; l++) {
                                                    if ((l - min_val) % interval == 0) {
                                                        for (var n = 0; n < answers.length; n++) {
                                                            if (id == answers[n].id && l == answers[n].value) {
                                                                m[l.toString()] = m[l.toString()] + 1;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                map[text] = m;
                            }
                            result[left] = map;
                        }
                    }
                }
                else if (zquestion.type == 2) {
                    // 多选题
                    // zanswerDetailList = answerDetailDao.getListByQuestionAndRelation(zquestion.getId(),surveyID,startTime,endTime,relation,objectID)
                    const zanswer_detail_list = await this.service.survey.answer.answerDetailGetListByQuestionAndRelation(zquestion.id, surveyID, beginTime, endTime, relation, objectID);
                    if (zanswer_detail_list == -1) {
                        return -1;
                    }
                    const zquestion_json = JSON.parse(zquestion.setting);
                    var zarray = zquestion_json.items;
                    if (yquestion.type == 1) {
                        // 单选题
                        var yquestion_json = JSON.parse(yquestion.setting);
                        var yarray = yquestion_json.items;
                        for (var i = 0; i < zarray.length; i++) {
                            var map = {};
                            for (var j = 0; j < yarray.length; j++) {
                                map[yarray[j].text] = 0;
                            }
                            var id = zarray[i].id;
                            for (var j = 0; j < zanswer_detail_list.length; j++) {
                                const answer_detail = zanswer_detail_list[j];
                                if (answer_detail.isanswered == 1) {
                                    const answer_json = JSON.parse(answer_detail.reply_content);
                                    const answers = answer_json.answers;
                                    for (var k = 0; k < answers.length; k++) {
                                        if (id == answers[k].id) {
                                            const yanswer_detail = await this.service.survey.answer.answerDetailGetAnswerDetailByUserAndQuestion(answer_detail.answer_id, yid);
                                            if (yanswer_detail.isanswered == 1) {
                                                const yanswer_json = JSON.parse(yanswer_detail.reply_content);
                                                const yaid = yanswer_json.id;
                                                for (var l = 0; l < yarray.length; l++) {
                                                    const yqid = yarray[l].id;
                                                    if (yaid == yqid) {
                                                        map[yarray[l].text] = map[yarray[l].text] + 1;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            result[zarray[i].text] = map;
                        }
                    }
                    else if (yquestion.type == 2) {
                        // 多选题
                        const yquestion_json = JSON.parse(yquestion.setting);
                        const yarray = yquestion_json.items;
                        for (var i = 0; i < zarray.length; i++) {
                            var map = {};
                            for (var j = 0; j < yarray.length; j++) {
                                map[yarray[j].text] = 0;
                            }
                            var id = zarray[i].id;
                            for (var j = 0; j < zanswer_detail_list.length; j++) {
                                const answer_detail = zanswer_detail_list[j];
                                if (answer_detail.isanswered == 1) {
                                    const answer_json = JSON.parse(answer_detail.reply_content);
                                    const answers = answer_json.answers;
                                    for (var k = 0; k < answers.length; k++) {
                                        if (id == answers[k].id) {
                                            const yanswer_detail = await this.service.survey.answer.answerDetailGetAnswerDetailByUserAndQuestion(answer_detail.answer_id, yid);
                                            if (yanswer_detail.isanswered == 1) {
                                                const yanswer_json = JSON.parse(yanswer_detail.reply_content);
                                                const yanswers = yanswer_json.answers;
                                                for (var l = 0; l < yarray.length; l++) {
                                                    const yqid = yarray[l].id;
                                                    for (var n = 0; n < yanswers.length; n++) {
                                                        if (yqid == yanswers[n].id) {
                                                            map[yarray[l].text] = map[yarray[l].text] + 1;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            result[zarray[i].text] = map;
                        }
                    }
                    else if (yquestion.type == 0) {
                        // 填空题
                        var list = [];
                        for (var i = 0; i < zarray.length; i++) {
                            var text_list = [];
                            var map = {};
                            const id = zarray[i].id;
                            map['id'] = id;
                            for (var j = 0; j < zanswer_detail_list.length; j++) {
                                const answer_detail = zanswer_detail_list[j];
                                if (answer_detail.isanswered == 1) {
                                    const answer_json = JSON.parse(answer_detail.reply_content);
                                    const answers = answer_json.answers;
                                    for (var k = 0; k < answers.length; k++) {
                                        if (id == answers[k].id) {
                                            const yanswer_detail = await this.service.survey.answer.answerDetailGetAnswerDetailByUserAndQuestion(answer_detail.answer_id, yid);
                                            if (yanswer_detail != null) {
                                                if (yanswer_detail.isanswered == 1) {
                                                    var m = {};
                                                    const reply_content = JSON.parse(yanswer_detail.reply_content);
                                                    const answer = reply_content.answer;
                                                    const tmp_date = new Date(yanswer_detail.created_on);
                                                    const date_str = tmp_date.getFullYear() + '-' + (tmp_date.getMonth()+1) + '-' + tmp_date.getDate() + ' ' + tmp_date.getHours() + ':' + tmp_date.getMinutes() + ':' + tmp_date.getSeconds();
                                                    m['time'] = date_str;
                                                    m['answer'] = answer;
                                                    text_list.push(m);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            map['textlist'] = text_list;
                            list.push(map);
                        }
                        result['analysis'] = list;
                    }
                    else if (yquestion.type == 3) {
                        // 量表题
                        const yquestion_json = JSON.parse(yquestion.setting);
                        const yarray = yquestion_json.y_axis;
                        const xarray = yquestion_json.x_axis;
                        for (var i = 0; i < yarray.length; i++) {
                            var m = {};
                            const id = yarray[i].id;
                            for (var j = 0; j < zarray.length; j++) {
                                const z_item_id = zarray[j].id;
                                var zm = {};
                                for (var k = 0; k < xarray.length; k++) {
                                    zm[xarray[k].tag] = 0;
                                }
                                for (var k = 0; k < zanswer_detail_list.length; k++) {
                                    const answer_detail = zanswer_detail_list[k];
                                    if (answer_detail.isanswered == 1) {
                                        const answer_json = JSON.parse(answer_detail.reply_content);
                                        const answers = answer_json.answers;
                                        for (var l = 0; l < answers.length; l++) {
                                            if (z_item_id == answers[l].id) {
                                                const yanswer_detail = await this.service.survey.answer.answerDetailGetAnswerDetailByUserAndQuestion(answer_detail.answer_id, yid);
                                                if (yanswer_detail.isanswered == 1) {
                                                    const yanswer_json = JSON.parse(yanswer_detail.reply_content);
                                                    const answers = yanswer_json.answers;
                                                    for (var n = 0; n < xarray.length; n++) {
                                                        const val = xarray[n].val;
                                                        for (var a = 0; a < answers.length; a++) {
                                                            if (id == answers[a].id && val == answers[a].val) {
                                                                zm[xarray[n].tag] = zm[xarray[n].tag] + 1;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                m[zarray[j].text] = zm;
                            }
                            result[yarray[i].left] = m;
                        }
                    }
                    else if (yquestion.type == 4) {
                        // 滑条题
                        const yquestion_json = JSON.parse(yquestion.setting);
                        const yarray = yquestion_json.items;
                        for (var i = 0; i < yarray.length; i++) {
                            var map = {};
                            const id = yarray[i].id;
                            const min_val = yarray[i].min_val;
                            const max_val = yarray[i].max_val;
                            const interval = yarray[i].interval;
                            const left = yarray[i].left;
                            for (var j = 0; j < zarray.length; j++) {
                                var m = {};
                                const zqid = zarray[j].id;
                                const text = zarray[j].text;
                                for (var k = min_val; k <= max_val; k++) {
                                    if ((k - min_val) % interval == 0) {
                                        m[k.toString()] = 0;
                                    }
                                }
                                for (var k = 0; k < zanswer_detail_list.length; k++) {
                                    const answer_detail = zanswer_detail_list[k];
                                    if (answer_detail.isanswered == 1) {
                                        const answer_json = JSON.parse(answer_detail.reply_content);
                                        const answers = answer_json.answers;
                                        for (var l = 0; l < answers.length; l++) {
                                            if (zqid == answers[l].id) {
                                                const yanswer_detail = await this.service.survey.answer.answerDetailGetAnswerDetailByUserAndQuestion(answer_detail.answer_id, yid);
                                                if (yanswer_detail.isanswered == 1) {
                                                    const yanswer_json = JSON.parse(yanswer_detail.reply_content);
                                                    const answers = yanswer_json.answers;
                                                    for (var n = min_val; n <= max_val; n++) {
                                                        if ((n - min_val) % interval == 0) {
                                                            for (var a = 0; a < answers.length; a++) {
                                                                if (id == answers[a].id && n == answers[a].value) {
                                                                    m[n.toString()] = m[n.toString()] + 1;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                map[text] = m;
                            }
                            result[left] = map;
                        }
                    }
                }
            }

            return result;
        }
        catch (error) {
            console.log('[service.survey.analyze.analysisSurvey]: error! --- ' + error);
            return -1;
        }
    }

    async surveyStatistics(surveyID, objectID, relation, beginTime, endTime){
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
            if (beginTime != null && endTime != null && beginTime != '' && endTime != '') {
                sql = sql + ' and created_on >STR_TO_DATE(?,\'%Y-%m-%d %H:%i:%s\') and created_on< STR_TO_DATE(?,\'%Y-%m-%d %H:%i:%s\')';
                para_list.push(beginTime);
                para_list.push(endTime);
            }
            const tmp_people_count = await this.app.mysql.query(sql, para_list);
            const people_count = tmp_people_count[0]['count(*)'];

            // List<Paragraph> paragraphList = paragraphDao.getListBySurvey(surveyID);
            const paragraph_list = await this.app.mysql.query('select * from paragraph where survey_id=? order by sequence', [surveyID]);

            if (paragraph_list == null || paragraph_list.length == 0) {
                // 无段落的情况
                var paragraph_map = {};
                var result_question_list = [];
                paragraph_map['title'] = '';
                paragraph_map['order'] = 1;
                var question_list = await this.app.mysql.query('select * from question where survey_id=? order by sequence', [surveyID]);
                if (question_list != null && question_list.length != 0) {
                    for (var j = 0; j < question_list.length; j++) {
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
                            }

                            else if (question_list[j].type == 3) {
                                // 量表题
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
                                var yarray = ques_setting_obj.items;
                                for (var k = 0; k < yarray.length; k++) {
                                    const id = yarray[k].id;
                                    const min_val = yarray[k].min_val;
                                    const max_val = yarray[k].max_val;
                                    const interval = parseInt(yarray[k].interval);
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
                            var answer_list = [];
                            for (var k = 0; k < answer_detail_list.length; k++) {
                                if (answer_detail_list[k].isanswered == 1) {
                                    var result_map = {};
                                    const answer_content_obj = JSON.parse(answer_detail_list[k].reply_content);
                                    const s = answer_content_obj.answer;
                                    result_map['answer'] = s;
                                    var tmp_date = new Date(answer_detail_list[k].created_on); //.format("yyyy-MM-dd HH:mm:ss");
                                    var date_str = tmp_date.getFullYear() + '-' + (tmp_date.getMonth()+1) + '-' + tmp_date.getDate() + ' ' + tmp_date.getHours() + ':' + tmp_date.getMinutes() + ':' + tmp_date.getSeconds();
                                    result_map['time'] = date_str;
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
            else {
                // 有段落分段的情况
                for (var i = 0; i < paragraph_list.length; i++) {
                    var paragraph_map = {};
                    var result_question_list = [];
                    paragraph_map['title'] = paragraph_list[i].introduction;
                    paragraph_map['order'] = paragraph_list[i].sequence;
                    var question_list = await this.app.mysql.query('select * from question where survey_id=? and paragraph_id=? order by sequence', [surveyID, paragraph_list[i].id]);
                    if (question_list != null && question_list.length != 0) {
                        for (var j = 0; j < question_list.length; j++) {
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
                                }

                                else if (question_list[j].type == 3) {
                                    // 量表题
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
                                    var yarray = ques_setting_obj.items;
                                    for (var k = 0; k < yarray.length; k++) {
                                        const id = yarray[k].id;
                                        const min_val = yarray[k].min_val;
                                        const max_val = yarray[k].max_val;
                                        const interval = parseInt(yarray[k].interval);
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
                                var answer_list = [];
                                for (var k = 0; k < answer_detail_list.length; k++) {
                                    if (answer_detail_list[k].isanswered == 1) {
                                        var result_map = {};
                                        const answer_content_obj = JSON.parse(answer_detail_list[k].reply_content);
                                        const s = answer_content_obj.answer;
                                        result_map['answer'] = s;
                                        var tmp_date = new Date(answer_detail_list[k].created_on); //.format("yyyy-MM-dd HH:mm:ss");
                                        var date_str = tmp_date.getFullYear() + '-' + (tmp_date.getMonth()+1) + '-' + tmp_date.getDate() + ' ' + tmp_date.getHours() + ':' + tmp_date.getMinutes() + ':' + tmp_date.getSeconds();
                                        result_map['time'] = date_str;
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

    async questionList(){
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

    async commit(survey){
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
                            creator_id: 24, 
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
            resource = "ibeem_test:question";
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

    async updateSurvey(surveyID, survey){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        var ttl = 1000;
        try {
            var tmp_survey = await this.app.mysql.select('survey', {where: {id: surveyID}});
            if (tmp_survey.length == 0) {
                // no such surveyID
                return -1;
            }
            else {
                const conn = await app.mysql.beginTransaction();

                // delete answer_detail by surveyID
                var resource1 = "ibeem_test:answer_detail";
                var res1 = await redlock.lock(resource1, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            var tmp_result = await conn.query('delete from answer_detail where answer_id in(select id from answer where survey_id=?)', [surveyID]);
                            lock.unlock().catch(function(err) {
                                console.log(err);
                            });
                            return 0;
                        }
                        catch (error) {
                            console.log('[service.survey.incease.updateSurvey.lockcallback]: error!!---' + error);
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
                    // exec transaction error!
                    return -3;
                }

                // delete answer by surveyID
                var resource2 = "ibeem_test:answer";
                var res2 = await redlock.lock(resource2, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            var tmp_result = await conn.delete('answer', {survey_id: surveyID});
                            lock.unlock().catch(function(err) {
                                console.log(err);
                            });
                            return 0;
                        }
                        catch (error) {
                            console.log('[service.survey.incease.updateSurvey.lockcallback]: error!!---' + error);
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

                // delete question by surveyID
                var resource3 = "ibeem_test:question";
                var res3 = await redlock.lock(resource3, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            var tmp_result = await conn.delete('question', {survey_id: surveyID});
                            lock.unlock().catch(function (err) {
                                console.log(err);
                            });
                            return 0;
                        }
                        catch (error) {
                            console.log('[service.survey.incease.updateSurvey.lockcallback]: error!!---' + error);
                            lock.unlock().catch(function(err) {
                                console.log(err);
                            });
                            return -1;
                        }
                    }
                    return transation();
                });
                if (res3 == -1) {
                    conn.rollback();
                    return -3;
                }

                // delete paragraph by surveyID
                var resource4 = "ibeem_test:paragraph";
                var res4 = await redlock.lock(resource4, ttl).then(function(lock) {
                    async function transation() {
                        try {
                            var tmp_result = await conn.delete('paragraph', {survey_id: surveyID});
                            lock.unlock().catch(function (err) {
                                console.log(err);
                            });
                            return 0;
                        }
                        catch (error) {
                            console.log('[service.survey.incease.updateSurvey.lockcallback]: error!!---' + error);
                            lock.unlock().catch(function(err) {
                                console.log(err);
                            });
                            return -1;
                        }
                    }
                    return transation();
                });
                if (res4 == -1) {
                    conn.rollback();
                    return -3;
                }

                // set survey detail and question and paragraph
                if (survey != undefined && survey != '') {
                    var json_obj = JSON.parse(survey);
                    const row = {
                        html: json_obj.html,
                        introduction: json_obj.introduction,
                        title: json_obj.title,
                        is_finished: json_obj.isFinished,
                        type: json_obj.pagingType,
                        number: json_obj.pagingNum,
                        state: 0,
                        updated_on: this.app.mysql.literals.now
                    };
                    const options = {
                        where: {
                            id: surveyID
                        }
                    };
                    var resource5 = "ibeem_test:survey";
                    var res5 = await redlock.lock(resource5, ttl).then(function(lock) {
                        async function transation() {
                            try {
                                var tmp_result = await conn.update('survey', row, options);
                                lock.unlock().catch(function (err) {
                                    console.log(err);
                                });
                                return 0;
                            }
                            catch (error) {
                                console.log('[service.survey.incease.updateSurvey.lockcallback]: error!!---' + error);
                                lock.unlock().catch(function(err) {
                                    console.log(err);
                                });
                                return -1;
                            }
                        }
                        return transation();
                    });
                    if (res5 == -1) {
                        conn.rollback();
                        return -3;
                    }
                    if (json_obj.dl != undefined && json_obj.length != 0) {
                        var resource6 = "ibeem_test:paragraph";
                        var paragraphIdList = [];
                        var res6 = await redlock.lock(resource6, ttl).then(function(lock) {
                            async function transation() {
                                try {
                                    var paragraph = json_obj.dl;
                                    for(var i in paragraph) {
                                        const result = await conn.insert('paragraph', {
                                            created_on: new Date(), 
                                            introduction: paragraph[i].title, 
                                            sequence: paragraph[i].order,
                                            survey_id: surveyID
                                        });
                                        paragraphIdList.push(result.insertId);
                                    }
                                    lock.unlock()
                                    .catch(function(err) {
                                        console.error(err);
                                    });
                                    return 0;
                                } 
                                catch (error) {
                                    console.log(error);
                                    lock.unlock()
                                    .catch(function(err) {
                                        console.error(err);
                                    });
                                    return -1;
                                }
                            }
                            return transation();
                        });
                        if(res6 == -1) {
                            conn.rollback();
                            return -3;
                        }

                        var resource7 = "ibeem_test:question";
                        var res7 = await redlock.lock(resource7, ttl).then(function(lock) {
                            async function transation() {
                                try {
                                    var paragraph = json_obj.dl;
                                    for(var i in paragraph){
                                        var question = paragraph[i].questionList;
                                        console.log(question)
                                        for(var j in question){
                                            await conn.insert('question', {
                                                created_on: new Date(), 
                                                required: question[j].required, 
                                                sequence: question[j].sequence, 
                                                setting: JSON.stringify(question[j].setting),
                                                survey_id: surveyID, 
                                                title: question[j].title, 
                                                type: question[j].type, 
                                                paragraph_id: paragraphIdList[i]
                                            });
                                        }
                                    }
                                    lock.unlock().catch(function(err) {
                                        console.error(err);
                                    });
                                    return 0;
                                } 
                                catch (error) {
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
                        if(res7 == -1) {
                            conn.rollback();
                            return -3;
                        }
                    }
                }

                await conn.commit();
            }
            return 0;
        }
        catch (error) {
            console.log('[service.survey.incease.updateSurvey]: error!!---' + error);
            return -2;
        }
    }

    async surveyDelete(surveyId){
        const { app, service } = this;
        const redlock = service.utils.lock.lockInit();
        const conn = await app.mysql.beginTransaction();
        var ttl = 1000;
        var res = null;
        try {
            res = await app.mysql.get('survey', {id: surveyId});
        } catch (error) {
            return -1;
        }
        if(res == null) return null;
        try {
            var resource = "ibeem_test:answer_detail";
            var res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.query('delete from answer_detail where answer_id in(select id from answer where survey_id = ?)', [surveyId]);
                    } catch (error) {
                        await conn.rollback();
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        res = -1;
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
            resource = "ibeem_test:answer";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('answer', {survey_id: surveyId});
                    } catch (error) {
                        await conn.rollback();
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        res = -1;
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
            resource = "ibeem_test:question";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('question', {survey_id: surveyId});
                    } catch (error) {
                        await conn.rollback();
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        res = -1;
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
            resource = "ibeem_test:paragraph";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('paragraph', {survey_id: surveyId});
                    } catch (error) {
                        await conn.rollback();
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        res = -1;
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
            resource = "ibeem_test:building_point_survey";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('building_point_survey', {survey_id: surveyId});
                    } catch (error) {
                        await conn.rollback();
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        res = -1;
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
            resource = "ibeem_test:building_survey";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('building_survey', {survey_id: surveyId});
                    } catch (error) {
                        await conn.rollback();
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        res = -1;
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
            resource = "ibeem_test:project_survey";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('project_survey', {survey_id: surveyId});
                    } catch (error) {
                        await conn.rollback();
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        res = -1;
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
                        await conn.delete('survey_relation', {survey_id: surveyId});
                    } catch (error) {
                        await conn.rollback();
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        res = -1;
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
            resource = "ibeem_test:survey";
            res = await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await conn.delete('survey', {id: surveyId});
                    } catch (error) {
                        await conn.rollback();
                        lock.unlock()
                        .catch(function(err) {
                            console.error(err);
                        });
                        res = -1;
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

    async surveyRelease(surveyId, operation){
        const { app } = this;
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:survey";
        var ttl = 1000;
        try {
            const res =  await redlock.lock(resource, ttl).then(function(lock) {
                async function transation() {
                    try {
                        await app.mysql.query('update survey set state = ? where id = ?', [operation, surveyId]);
                    } catch (error) {
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
            return res;
        } catch (error) {
            return -1;
        }
    }
}

module.exports = SurveyService;