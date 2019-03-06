'use strict';

const Service = require('egg').Service;

class UserService extends Service {
    async getUser(userId, code){
        const { ctx, app } = this;
        const getAccessTokenUrl = ctx.helper.formatGetUserAccessToken(ctx.app.config.wexin.apiUrl.oauth2AccessTokenApi, ctx.app.config.wexin.apiDomain, ctx.app.config.wexin.appId, ctx.app.config.wexin.appScrect, code);
        const result1 = await ctx.service.utils.http.wexinGet(getAccessTokenUrl);
        if(result1.errcode){
            return -1;
        }
        const getUserInfoUtl = ctx.helper.formatGetUserInfo(ctx.app.config.wexin.apiUrl.getUserInfoApi, result1.access_token, result1.openid);
        const result2 = await ctx.service.utils.http.wexinGet(getUserInfoUtl);
        if(result2.errcode){
            return -1;
        }
        const redlock = this.service.utils.lock.lockInit();
        const resource = "ibeem_test:user";
        const ttl = 1000;
        const conn = await app.mysql.beginTransaction();
        const res = await redlock.lock(resource, ttl)
        .then(async function(){
            await conn.update('user', {
                id:          userId,
                wechat_name: result2.nickname,
                wechat_oid:  result2.openid
            });
        })
        .then(async function(){
            await conn.query('update device set wechat_name = ?, wechat_oid = ? where user_id = ?', [
                result2.nickname,
                result2.openid,
                userId
            ]);
        })
        .catch(function(err){
            console.log(err);
            return -1;
        });
        if(res == -1) return -1;
        return 0;
    }
}

module.exports = UserService;