'use strict';

const Controller = require('egg').Controller;
const path = require('path');
const fs = require('fs');
const awaitWriteStream = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');

class CommonController extends Controller {
    async leftpanel() {
        await this.ctx.render('common/components/leftpanel.html');
    }
    async adminLeftpanel(){
        await this.ctx.render('common/components/leftpanel_manage.html');
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
        await this.ctx.render('common/components/memberList_item.html');
    }
    async upload(){
        const { ctx, config } = this;
        const stream = await ctx.getFileStream();
        const filename = ctx.helper.crypto(stream.filename + Date.now()).substring(8, 24) + '.' + stream.filename.split('.')[stream.filename.split('.').length - 1];
        const dir = path.join(config.baseDir, 'app/public/file/image');
        ctx.helper.mkdirSync(dir);
        const target = path.join(config.baseDir, 'app/public/file/image', filename);
        const writeStream = fs.createWriteStream(target);
        try {
            await awaitWriteStream(stream.pipe(writeStream));
        } catch (error) {
            await sendToWormhole(stream);
            return ctx.body = {
                code: 1005
            };
        }
        const url = {
            imageurl: filename
        };
        ctx.body = {
            code: 200,
            imageList: [url]
        };
    }

    async tjDX() {
        await this.ctx.render('common/components/tjDX.html');
    }
    async tjHK() {
        await this.ctx.render('common/components/tjHK.html');
    }
    async tjLB() {
        await this.ctx.render('common/components/tjLB.html');
    }
    async tjTK() {
        await this.ctx.render('common/components/tjTK.html');
    }
    async tjTKModal() {
        await this.ctx.render('common/components/tjTKModal.html');
    }
}

module.exports = CommonController;