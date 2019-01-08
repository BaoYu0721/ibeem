'use strict';

const Service = require('egg').Service;

class DownloadService extends Service {
    async answer(surveyId, sTime, eTime, relation, pbId){
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

    async question(surveyId) {
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
}

module.exports = DownloadService;