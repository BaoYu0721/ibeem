'use strict';

const Controller = require('egg').Controller;

class DeviceController extends Controller {
    async index(){
        const { ctx } = this;
        const did = ctx.query.did;
        const item = ctx.query.item;
        if(did && item == "realtime"){
            return await ctx.render('mobile/realtimeData.html', {
                did: did
            });
        }else if(did && item == "detail"){
            return await ctx.render('mobile/deviceDetail.html', {
                did: did
            });
        }else if(did && item == "history"){
            return await ctx.render('mobile/historyData.html', {
                did: did
            });
        }else if(did && item == "evaluation"){
            return await ctx.render('mobile/evaluation.html', {
                did: did
            });
        }else if(did && item == "room"){
            return await ctx.render('mobile/homeSetting.html', {
                did: did
            });
        }
        const ticket = await ctx.service.utils.weixin.getTicket();
        if(ticket == -1){
            return ctx.body = {
                code: -1
            };
        }else{
            await ctx.render('mobile/list.html', {
                JsapiTicket: ticket
            })
        }
    }

    async deviceList(){
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const result = await ctx.service.weixin.device.deviceList(userId);
        if(result == -1){
            return ctx.body = {
                status: -1
            }
        }
        ctx.body = {
            status: 0,
            devicelist: result
        };
    }

    async infoUpdate(){
        const { ctx } = this;
        const result = await ctx.service.weixin.device.infoUpdate(ctx.request.body);
        if(result == -1){
            return ctx.body = {
                code: 1003,
                messg: "设备信息跟新失败!"
            };
        }
        ctx.body = {
            code: 200
        };
    }

    async deviceRealtimeData(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceId;
        const result = await ctx.service.weixin.device.deviceRealtimeData(deviceId);
        if(result == -1){
            return ctx.body = {
                status: -1,
                meg: "未知错误"
            };
        }
        const status = await ctx.service.device.status.getStatus(deviceId);
        ctx.body = {
            zt: status,
            status: 0,
            data: result
        }
    }

    async deviceDetail(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceID;
        const result = await ctx.service.weixin.device.deviceDetail(deviceId);
        if(result == -1 || result == null){
            return ctx.body = {
                code: 1005,
                meg: "未知错误"
            };
        }
        ctx.body = {
            code: 200,
            device: result
        }
    }

    async deviceHistory(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceId;
        const startTime = ctx.request.body.startTime;
        const endTime = ctx.request.body.endTime;
        const result = await ctx.service.weixin.device.deviceHistory(deviceId, startTime, endTime);
        if(result == -1 || result == null){
            return ctx.body = {
                result: "error"
            };
        }
        ctx.body = {
            result: "success",
            data: result.data,
            deviceId: deviceId,
            deviceName: result.deviceName
        };
    }

    async deviceEvaluation(){
        const { ctx } = this;
        const deviceId = ctx.request.body.deviceID;
        const result = await ctx.service.weixin.device.deviceEvaluation(deviceId);
        if(result == -1){
            return ctx.body = {
                code: 1005,
                messg: "未知错误"
            };
        }
        ctx.body = {
            code: 200,
            content: result
        };
    }

    async deviceAddAttention(){
        const { ctx } = this;
        const user = ctx.cookies.get(ctx.app.config.auth_cookie_name);
        const userId = user.split('^_^')[0];
        const deviceId = ctx.request.body.deviceID;
        const result = await ctx.service.weixin.device.deviceAddAttention(userId, deviceId);
        if(result == -1){
            return ctx.body = {
                code: 1005,
                messg: "系统繁忙"
            };
        }
        ctx.body = {
            code: 200,
            messg: result
        };
    }

    async qrcodeLogin(){
        const { ctx } = this;
        const token = ctx.query.token;
        const arr = token.split('<==>');
        const did = arr[0];
        const device = await ctx.service.weixin.device.qrcodeLogin(did);
        if(device == -1 || !device){
            ctx.redirect('/weixin/index');
        }
        else{
            const opt = {
                httpOnly: false,
                sing: false
            };
            ctx.cookies.set('device_id', device.id, opt);
            ctx.cookies.set('device_name', device.name, opt);
            ctx.cookies.set('login_type', 'device', opt);
            ctx.redirect('/weixin/device?did=' + device.id + "&item=realtime" + "&timestamp=" + Date.parse(new Date()));
        }
    }
}

module.exports = DeviceController;