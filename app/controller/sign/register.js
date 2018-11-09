'use strict';

const Controller = require('egg').Controller;

class RegisterController extends Controller {
    async index() {
        await this.ctx.render('manage/register.html');
    }
}

module.exports = RegisterController;