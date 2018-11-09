'use strict';

const Controller = require('egg').Controller;

class ForgetPasswordController extends Controller {
    async index() {
        await this.ctx.render('manage/forgetPassword.html');
    }
}

module.exports = ForgetPasswordController;