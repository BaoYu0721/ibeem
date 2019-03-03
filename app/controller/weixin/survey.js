'use strict';

const Controller = require('egg').Controller;

class SurveyController extends Controller {
    async index() {
        await this.ctx.render('mobile/mobileSurveyList.html');
    }

    async answer(){
        await this.ctx.render('mobile/mobileSurvey.html');
    }

    async dimension(){
        await this.ctx.render('mobile/mobileSurveyTree.html');
    }

    async releaseSurvey(){
        const result = await this.ctx.service.weixin.survey.releaseSurvey();
        if(result == -1){
            return this.ctx.body = {
                code:  1005,
                messg: "系统繁忙"
            };
        }
        this.ctx.body = {
            code: 200,
            list: result
        };
    }
}

module.exports = SurveyController;
