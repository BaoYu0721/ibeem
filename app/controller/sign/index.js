'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index(){
        const { ctx } = this;
        const item = ctx.query.item;
        if(item == undefined){
            await this.ctx.render('manage/login.html');
        }else if(item == 'forget_password'){
            await this.ctx.render('manage/forgetPassword.html');
        }else if(item == 'register'){
            await this.ctx.render('manage/register.html');
        }
    }
}

module.exports = IndexController;