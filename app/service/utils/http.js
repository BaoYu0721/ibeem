'use strict';

const Service = require('egg').Service;

class HttpService extends Service {

    async urlReq(url){
        const { ctx } = this;
        try {
            const result = await ctx.curl(url);
            return result.data.toString();
        } catch (error) {
            return -1;
        }
    }

    async cocleanPost(url, param){
        const { ctx } = this;
        const time =  Date.parse(new Date())/1000;
        const sig = ctx.helper.crypto(ctx.app.config.deviceDataReqUrl.coclean.appId + ctx.app.config.deviceDataReqUrl.coclean.appKey + time);
        try {
            const result = await ctx.curl(url, {
                method: 'POST',
                timeout: 3000,
                data: {
                    appId: ctx.app.config.deviceDataReqUrl.coclean.appId,
                    time: time,
                    sig: sig,
                    param: JSON.stringify(param)
                }
            });
            return JSON.parse(result.data.toString());
        } catch (error) {
            console.log(error);
            return -1;
        }
    }

    async ibeemGet(url, param){
        const { ctx } = this;
        const reqUrl = url + '?' + param;
        try {
            const result = await ctx.curl(reqUrl);
            return JSON.parse(result.data.toString());
        } catch (error) {
            console.log(error);
            return -1;
        }
    }

    async tencentMapGet(location_ip) {
        const { ctx } = this;
        const reqUrl = ctx.app.config.tencentMap.url + '?ip=' + location_ip + '&key=' + ctx.app.config.tencentMap.key;
        try {
            const result = await ctx.curl(reqUrl);
            return JSON.parse(result.data.toString());
        } catch (error) {
            console.log(error);
            return -1;
        }
    }

    async wexinGet(url){
        const { ctx } = this;
        try {
            const result = await ctx.curl(url);
            return JSON.parse(result.data.toString());
        } catch (error) {
            console.log(error)
            return -1;
        }
    }

    async weixinUpload(url){
        const { ctx } = this;
        try {
            const result = await ctx.curl(url);
            const filename = result.headers['content-disposition'].split('=')[1];
            return {
                data: result.data,
                name: filename
            };
        } catch (error) {
            console.log(error);
            return -1;
        }
    }

}

module.exports = HttpService;