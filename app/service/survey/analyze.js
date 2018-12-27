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

    async analysisSurvey(surveyID, zid, yid, type, startTime, endTime, relation, objectID) {
        console.log('entered!!!');
        return -1;
    }
}

module.exports = AnalyzeService;