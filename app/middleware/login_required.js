'use strict';

module.exports = () => {

  /*
   * 需要登入
   */
  return async function(ctx, next) {
    const user = ctx.cookies.get(ctx.app.config.auth_cookie_name, { signed: true });
    if (user == undefined) {
      await ctx.render('manage/login.html');
      return;
    }
    await next();
  };
};