'use strict';

module.exports = () => {

  /*
  * 需要登录
  */
  return async function(ctx, next) {
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name, { signed: true });
    if (user == undefined) {
      ctx.status = 403;
      ctx.body = 'forbidden!';
      return;
    }
    await next();
  };
};