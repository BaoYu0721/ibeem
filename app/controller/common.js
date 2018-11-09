'use strict';

const Controller = require('egg').Controller;


class CommonController extends Controller {
    async leftpanel() {
        await this.ctx.render('common/components/leftpanel.html');
    }
    async alert() {
        await this.ctx.render('common/components/alert.html');
    }
    async alertOk() {
        await this.ctx.render('common/components/alertOk.html');
    }
    async alertOk2() {
        await this.ctx.render('common/components/alertOk2.html');
    }
    async loading() {
        await this.ctx.render('common/components/loading.html');
    }
    async mobilealertOk() {
        await this.ctx.render('common/components/mobilealertOk.html');
    }
    async mobileloading() {
        await this.ctx.render('common/components/mobileloading.html');
    }
    async teamListItem() {
        await this.ctx.render('common/components/teamList_item.html');
    }
    async questionDx() {
        await this.ctx.render('common/components/questionDx.html');
    }
    async questionDDX() {
        await this.ctx.render('common/components/questionDDX.html');
    }
    async questionTK() {
        await this.ctx.render('common/components/questionTK.html');
    }
    async questionLB() {
        await this.ctx.render('common/components/questionLB.html');
    }
    async questionZX() {
        await this.ctx.render('common/components/questionZX.html');
    }
    async questionDL() {
        await this.ctx.render('common/components/questionDL.html');
    }
    async memberList() {
        await this.ctx.render('common/components/memberList_item.html')
    }
}

module.exports = CommonController;