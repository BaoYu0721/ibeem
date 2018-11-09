'use strict';

const Controller = require('egg').Controller;

class LogoutController extends Controller {
    async index() {
        const { ctx } = this;
        ctx.cookies.set(ctx.app.config.auth_cookie_name, null);
        ctx.body = {
            code: 200
        };
    }
}

module.exports = LogoutController;