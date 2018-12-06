'use strict';

module.exports = () => {

    /*
    * 需要登录
    */
    return async function(ctx, next) {
        const admin = ctx.cookies.get(ctx.app.config.auth_cookie_admin, { signed: true });
        if (admin != ctx.helper.crypto('^_^' + ctx.app.config.admin.name + '^_^')) {
            ctx.status = 403;
            ctx.body = 'forbidden!';
            return;
        }
        await next();
    };
};