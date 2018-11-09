'use strict';

const Controller = require('egg').Controller;

class AnalyzeController extends Controller {
    async index() {
        await this.ctx.render('manage/surveyAnalysis.html');
    }
}

module.exports = AnalyzeController;