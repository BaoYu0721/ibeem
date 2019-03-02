'use strict';

const Service = require('egg').Service;

class AnalyzeService extends Service {
    async getDimension(surveyID) {
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

    async analysisSurvey(surveyID, zid, yid, type, beginTime, endTime, relation, objectID) {
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
}

module.exports = AnalyzeService;