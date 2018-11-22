'use strict';

const Service = require('egg').Service;

class HttpService extends Service {
    async createExportOrder(data){
        const { ctx } = this;
        const time =  Date.parse(new Date())/1000;
        const sig = ctx.helper.crypto(ctx.app.config.deviceDataReqUrl.coclean.appId + ctx.app.config.deviceDataReqUrl.coclean.appKey + time);
        const parmas = "appId=" + ctx.app.config.deviceDataReqUrl.coclean.appId + "&time=" + time + "&sig=" + sig + "&param=" + JSON.stringify(data);
        const url = ctx.app.config.deviceDataReqUrl.coclean.createExportOrder + "?" + parmas;
        const result = await ctx.curl(url, {
            method: 'POST',
            contentType: 'json',
            dataType: 'json',
            timeout: 3000
        });
        return result.data;
    }

    async getCocleanStatus(data){
        const { ctx } = this;
        const time =  Date.parse(new Date())/1000;
        const sig = ctx.helper.crypto(ctx.app.config.deviceDataReqUrl.coclean.appId + ctx.app.config.deviceDataReqUrl.coclean.appKey + time);
        const parmas = "appId=" + ctx.app.config.deviceDataReqUrl.coclean.appId + "&time=" + time + "&sig=" + sig + "&param=" + JSON.stringify(data);
        const url = ctx.app.config.deviceDataReqUrl.coclean.deviceIsOnline + "?" + parmas;
        const result = await ctx.curl(url, {
            method: 'POST',
            contentType: 'json',
            dataType: 'json',
            timeout: 3000
        });
        return result.data;
    }

    async getCocleanData(deviceId){
        const { ctx } = this;
        const time =  Date.parse(new Date())/1000;
        const sig = ctx.helper.crypto(ctx.app.config.deviceDataReqUrl.coclean.appId + ctx.app.config.deviceDataReqUrl.coclean.appKey + time);
        const parmas = "appId=" + ctx.app.config.deviceDataReqUrl.coclean.appId + "&time=" + time + "&sig=" + sig + "&param=" + "{\"deviceId\":"+deviceID+"}";
        const url = ctx.app.config.deviceDataReqUrl.coclean.readDeviceRealtimeDataUrl + "?" + parmas;
        const result = await ctx.curl(url, {
            method: 'POST',
            contentType: 'json',
            dataType: 'json',
            timeout: 3000
        });
        return result.data;
    }

    async getIbeemStatus(deviceId){
        const { ctx } = this;
        const param = "q=" + deviceId;
        const url = ctx.app.config.deviceDataReqUrl.ibeem.getDeviceOnlineStatus + '?' + param;
        const result = await ctx.curl(url);
        return result.data;
    }

}

module.exports = HttpService;