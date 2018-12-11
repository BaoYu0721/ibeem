'use strict';

const Service = require('egg').Service;

class HttpService extends Service {

    async cocleanPost(url, param){
        const { ctx } = this;
        const time =  Date.parse(new Date())/1000;
        const sig = ctx.helper.crypto(ctx.app.config.deviceDataReqUrl.coclean.appId + ctx.app.config.deviceDataReqUrl.coclean.appKey + time);
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
    }

    async ibeemGet(url, param){
        const { ctx } = this;
        const reqUrl = url + '?' + param;
        const result = await ctx.curl(reqUrl);
        return JSON.parse(result.data.toString());
    }

    async tencentMapGet(location_ip) {
        const { ctx } = this;
        const reqUrl = ctx.app.config.tencentMap.url + '?ip=' + location_ip + '&key=' + ctx.app.config.tencentMap.key;
        const result = await ctx.curl(reqUrl);
        return JSON.parse(result.data.toString());
    }

}

module.exports = HttpService;